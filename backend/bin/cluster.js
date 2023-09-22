const cluster = require("cluster");
const os = require("os");
const config = require("../config/config.json");


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const numOfCpus = os.cpus().length;
    const requiredInstances = config.clusterSettings?.instanceCount || numOfCpus;

    const numOfWorkers = Math.min(numOfCpus, requiredInstances);

    // Fork workers
    for (let i = 0; i < numOfWorkers; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    require("./server.js");
    console.log(`Worker ${process.pid} started`);
}