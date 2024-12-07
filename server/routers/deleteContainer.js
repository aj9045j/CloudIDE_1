const Docker = require('dockerode');
const docker = new Docker();

// Function to delete (stop) a container by its containerId
async function deleteContainer(req, res) {
    const { containerId } = req.body;
    console.log(containerId," deleted");
    if (!containerId) {
        return res.status(400).json({ error: 'Container ID is required' });
    }

    try {
        // Find the container by its ID
        const container = docker.getContainer(containerId);

        // Stop the container
        await container.stop();

        // Optionally remove the container if you want to clean it up completely
        await container.remove();

        // Remove the container from activeContainers tracking (if applicable)

        console.log(`Container ${containerId} has been stopped and removed`);

        res.status(200).json({ message: `Container ${containerId} stopped and removed successfully` });
    } catch (error) {
        console.error(`Error stopping container ${containerId}:`, error);
        res.status(500).json({ error: `Failed to stop container ${containerId}: ${error.message}` });
    }
}

module.exports = { deleteContainer };
