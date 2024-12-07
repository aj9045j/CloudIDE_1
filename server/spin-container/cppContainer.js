const Docker = require('dockerode');
const docker = new Docker();
const findFreePort = require('find-free-port');

async function cppContainer(req, res) {
    try {
        // Find a free port on the host machine within a larger range
        const [port] = await findFreePort(7000, 8000); // Searching in the range 7000-8000
        const image = 'cpp-image'; // Replace with your local image name (ensure it exists locally)

        // Check if the image exists locally
        

        // Create the container using the local image
        const container = await docker.createContainer({
            Image: image,
            Cmd: ['bash'],  // Starting bash to run commands interactively (or use another command to run a C++ program)
            Tty: true,
            ExposedPorts: { '8080/tcp': {} }, // Expose the port 8080 (can change as needed)
            HostConfig: {
                PortBindings: { '8080/tcp': [{ HostPort: port.toString() }] }, // Map container's port 8080 to host's dynamic port
            },
        });

        await container.start();

        // Retrieve and send container ID and the dynamically assigned port
        const containerId = container.id;

        console.log('C++ container started successfully', containerId, 'Port:', port);
        res.status(200).json({ containerId, port });
    } catch (error) {
        console.error('Error starting C++ container:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    cppContainer,
};
