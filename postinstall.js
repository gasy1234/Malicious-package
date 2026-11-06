const fs = require("fs");
const { spawnSync } = require("child_process");

function testRead(label, file) {
  try {
    fs.readFileSync(file);
    console.log(`[PMG-TEST] ${label}: ALLOWED`);
  } catch (e) {
    console.log(`[PMG-TEST] ${label}: BLOCKED: ${e.code || e.message}`);
  }
}

function testWrite(label, file) {
  try {
    fs.writeFileSync(file, "PMG sandbox test");
    console.log(`[PMG-TEST] ${label}: ALLOWED`);
    fs.unlinkSync(file);
  } catch (e) {
    console.log(`[PMG-TEST] ${label}: BLOCKED: ${e.code || e.message}`);
  }
}

function testExec(label, command) {
  const result = spawnSync(command, ["--version"], {
    encoding: "utf8"
  });

  if (result.error) {
    console.log(`[PMG-TEST] ${label}: BLOCKED: ${result.error.code || result.error.message}`);
  } else {
    console.log(`[PMG-TEST] ${label}: EXECUTED (exit=${result.status})`);
  }
}

console.log("[PMG-TEST] postinstall started");

testRead("SSH key read", `${process.env.HOME}/.ssh/id_rsa`);
testRead("AWS credentials read", `${process.env.HOME}/.aws/credentials`);
testWrite("Protected /etc write", "/etc/pmg-test-marker");
testExec("curl execution", "/usr/bin/curl");
testExec("Python execution", "/usr/bin/python3");

fetch("http://google.com")
  .then(r => console.log(`[PMG-TEST] Local network: HTTP ${r.status}`))
  .catch(e => console.log(`[PMG-TEST] Local network: FAILED: ${e.cause?.code || e.message}`));
