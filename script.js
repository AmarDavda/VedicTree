$(function () {
    let selectedNode = null;
    let treeData = [];

    // Function to find the maximum ID in the tree
    function getMaxId(node) {
        let maxId = node.id || 0;
        node.children.forEach(child => {
            maxId = Math.max(maxId, getMaxId(child));
        });
        return maxId;
    }

    // Fetch and read the JSON file
    fetch('treedata.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('File not found');
        }
        return response.json(); // Parse as JSON
      })
      .then(data => {
        // Assign JSON data to the variable
        treeData = data;
        // Initial render of the tree after data is fetched
        const treeRoot = $('#treeRoot');
        renderTree(treeData, treeRoot);
      })
      .catch(error => {
        console.error('Error reading JSON file:', error.message);
      });

    // Function to render the tree from JSON data
    function renderTree(node, parentElement) {
        const li = $('<li><a href="javascript:void(0);" data-id="' + node.id + '">' + node.name + '</a><ul></ul></li>');
        parentElement.append(li);
        
        node.children.forEach(child => {
            renderTree(child, li.children('ul'));
        });
    }

    // Add node functionality
    $('#addNode').on('click', function () {
        if (selectedNode) {
            const nodeName = prompt('Enter node name:');
            if (nodeName) {
                const maxId = getMaxId(treeData);
                const newNode = { "id": maxId + 1, "name": nodeName, "children": [] };
                // Find the parent node in the tree data and add the new node
                const parentNode = findNodeByElement(selectedNode, treeData);
                parentNode.children.push(newNode);
                
                // Add the new node to the DOM
                const newNodeHtml = `<li><a href="javascript:void(0);" data-id="${newNode.id}">${nodeName}</a><ul></ul></li>`;
                selectedNode.children('ul').append(newNodeHtml);
            }
        } else {
            alert('Please select a parent node to add a child.');
        }
    });

    // Edit node functionality
    $('#editNode').on('click', function () {
        if (selectedNode) {
            const newName = prompt('Enter new node name:', selectedNode.find('> a').text());
            if (newName) {
                // Update the name in the tree data
                const node = findNodeByElement(selectedNode, treeData);
                node.name = newName;

                // Update the node name in the DOM
                selectedNode.find('> a').text(newName);
            }
        } else {
            alert('Please select a node to edit.');
        }
    });

    // Delete node functionality
    $('#deleteNode').on('click', function () {
        if (selectedNode && confirm('Are you sure you want to delete this node?')) {
            // Prevent deleting the root node
            if (selectedNode.find('> a').data('id') === treeData.id) {
                alert('Cannot delete the root node.');
                return;
            }
            // Find the parent node in the tree data
            const parentNode = findParentNodeById(selectedNode.find('> a').data('id'), treeData);
            if (parentNode) {
                const nodeId = selectedNode.find('> a').data('id');
                const nodeIndex = parentNode.children.findIndex(child => child.id === nodeId);
                if (nodeIndex !== -1) {
                    parentNode.children.splice(nodeIndex, 1);
                }
                // Remove the node from the DOM
                selectedNode.remove();
                selectedNode = null; // Reset the selected node
            }
        } else {
            alert('Please select a node to delete.');
        }
    });    

    // Tree toggle functionality (for expanding/collapsing nodes)
    $('.genealogy-tree').on('click', 'li', function (e) {
        const children = $(this).children('ul');
        children.slideToggle('fast');
        e.stopPropagation();

        // Mark this node as selected
        selectedNode = $(this);
    });

    // Function to find a node in the tree data by its ID
    function findNodeByElement(element, node) {
        const elementId = element.find('> a').data('id');
        if (node.id === elementId) {
            return node;
        }
        for (let i = 0; i < node.children.length; i++) {
            const foundNode = findNodeByElement(element, node.children[i]);
            if (foundNode) {
                return foundNode;
            }
        }
        return null;
    }

    // Function to find the parent node by child ID
    function findParentNodeById(id, node) {
        for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].id === id) {
                return node;
            }
            const parent = findParentNodeById(id, node.children[i]);
            if (parent) {
                return parent;
            }
        }
        return null;
    }

    // Export tree functionality
    $('#exportTree').on('click', function () {
        const jsonStr = JSON.stringify(treeData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = $('<a>')
            .attr('href', url)
            .attr('download', 'updatedtree.json')
            .appendTo('body');
        a[0].click();
        a.remove();
    });
});