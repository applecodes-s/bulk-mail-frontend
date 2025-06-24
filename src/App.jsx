import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [emails, setEmails] = useState([]);

  function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const emailList = json.map((row) => row[0]).filter(email => !!email);
      setEmails(emailList);
      console.log("📄 Emails extracted:", emailList);
    };

    reader.readAsArrayBuffer(file);
  }

  function sendEmails(e) {
    e.preventDefault();

    if (!subject || !msg || emails.length === 0) {
      alert("⚠️ Please fill all fields and upload email list.");
      return;
    }

    axios.post("http://localhost:3000/sendemail", {
      subject,
      msg,
      emailList: emails
    })
      .then(res => {
        alert("✅ Emails sent successfully!");
        console.log(res.data);
        setSubject('');
        setMsg('');
        setEmails([]);
      })
      .catch(err => {
        alert("❌ Error sending emails");
        console.error(err);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-400 px-4 py-10">
      <form className="bg-white p-8 rounded-xl shadow-lg space-y-6 w-full max-w-lg">

        <h1 className="text-2xl font-bold text-center text-blue-700">📬 Bulk Mail Sender</h1>

        <input
          type="text"
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="5"
          placeholder="Write your message here..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Upload Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFile}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
        </div>

        {emails.length > 0 && (
          <div className="text-sm text-green-700 font-medium">
            ✅ {emails.length} emails loaded from file
          </div>
        )}

        <button
          type="submit"
          onClick={sendEmails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          🚀 Send Emails
        </button>
      </form>
    </div>
  );
}

export default App;
