const fs = require("fs");
const fileName = "token_data.json";
const renamedFile = "token_data_backup.json";

try {
  const initialData = JSON.stringify([
    { tokenNumber: "T1", userId: "user001", status: "waiting", purpose: "General" }
  ], null, 2);

  fs.writeFileSync(fileName, initialData);
  console.log("File created and token data written successfully");

  let data = fs.readFileSync(fileName, "utf8");
  console.log("Reading file content:");
  console.log(data);

  const tokens = JSON.parse(data);
  tokens.push({ tokenNumber: "T2", userId: "user002",
    status: "serving", purpose: "Billing" });
  fs.writeFileSync(fileName, JSON.stringify(tokens, null, 2));
  console.log("New token appended successfully");

  data = fs.readFileSync(fileName, "utf8");
  console.log("Updated file content:");
  console.log(data);

  fs.renameSync(fileName, renamedFile);
  console.log("File renamed successfully");

  fs.unlinkSync(renamedFile);
  console.log("File deleted successfully");

} catch (error) {
  console.error("File operation error:", error.message);
}