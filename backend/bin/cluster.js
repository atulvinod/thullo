const cluster = require("cluster");
const os = require("os");


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    const numOfCpus = os.cpus().length;
    const requiredInstances = process.env.CLUSTER_SETTINGS__INSTANCE_COUNT || numOfCpus;

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