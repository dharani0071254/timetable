async function test() {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Department" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}
test();
