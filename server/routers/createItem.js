const Docker = require('dockerode');
const fs = require('fs');

// Create a file or folder inside the Docker container
async function createItem(req, res) {
    const docker = new Docker();
    const { containerId } = req.body;
    const { type, path } = req.body; // type: 'file' or 'folder', path: the full path inside the container

    try {
        const container = docker.getContainer(containerId);

        let cmd = '';
        if (type === 'file') {
            cmd = `touch ${path}`; // Command to create a new file
        } else if (type === 'folder') {
            cmd = `mkdir -p ${path}`; // Command to create a new folder
        } else {
            return res.status(400).json({ error: 'Invalid item type' });
        }

        // Execute the command inside the container
        const exec = await container.exec({
            Cmd: ['sh', '-c', cmd],
            AttachStdout: true,
            AttachStderr: true
        });

        const stream = await exec.start();
        let data = '';

        stream.on('data', (chunk) => {
            data += chunk.toString();
        });

        stream.on('end', () => {
            res.json({ success: true, message: `${type} created at ${path}` });
        });

    } catch (error) {
        console.error('Error creating item inside container:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
}

module.exports = {
    createItem,
};
