const bcrypt = require('bcrypt');
async function run() {
    const hash = await bcrypt.hash('123456', 10);
    console.log(hash);
    const fs = require('fs');
    fs.writeFileSync('hash.txt', hash);
}
run();
