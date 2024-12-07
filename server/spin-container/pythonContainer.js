const Docker = require('dockerode');
const docker = new Docker();
const findFreePort = require('find-free-port');

async function pythonContainer(req, res) {
    try {
        // Find a free port on the host machine within a specified range
        const [port] = await findFreePort(5000, 6000); // Searching in the range 5000-6000
        const image = 'python-image'; // Your local Python image (replace with the correct image name)
        
        // Create the container using the local image
        const container = await docker.createContainer({
            Image: image,
            Cmd: ['/bin/sh'],  // For Alpine-based images
            Tty: true,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            ExposedPorts: { '3000/tcp': {} },
            HostConfig: {
                PortBindings: { '3000/tcp': [{ HostPort: port.toString() }] },
            },
        });

        await container.start();

        // Retrieve and send container ID and the dynamically assigned port
        const containerId = container.id;

        console.log('Python container started successfully', containerId, 'Port:', port);
        res.status(200).json({ containerId, port });
    } catch (error) {
        console.error('Error starting Python container:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    pythonContainer,
};
