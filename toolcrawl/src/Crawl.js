import React, { useState } from "react";
import axios from "axios";
import "./Crawl.css";
import { Helmet } from "react-helmet";

const Crawl = () => {
  const [link, setLink] = useState("");
  const [number, setNumber] = useState(1);
  const [state, setState] = useState(false);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState([]);
  const [name, setName] = useState("");
  const handleClick = () => {
    // Kiểm tra xem tất cả các trường thông tin đã được nhập đủ hay chưa
    if (link.trim() === "" || number <= 0 || name.trim() === "") {
      alert("Vui lòng nhập đủ thông tin (Link, Số trường, Tên file)!");
      return;
    }

    // Tạo một mảng mới với số lượng phần tử là number
    const newItems = Array.from(
      { length: Number(number) },
      (_, index) => index + 1
    );

    setItems(newItems);
    setState(true);
  };

  const handleCrawlData = async () => {
    try {
      const response = await axios.post("http://localhost:3001/crawlAndSave", {
        url: link,
        classNames: input,
        fileName: name + ".xlsx",
      });
      if (response.data.status) {
        alert("Crawl data thành công");
        setState(false);
        setLink("");
        setNumber(1);
        setName("");
      } else {
        alert("Crawl data thất bại");
        setState(false);
        setLink("");
        setNumber(1);
        setName("");
      }
    } catch (error) {
      alert("Thông tin đầu vào không đúng!");
      setState(false);
      setLink("");
      setNumber(1);
      setName("");
    }
  };
  return (
    <>
      <Helmet>
        <title>Tool crawl</title>
      </Helmet>
      <h1 style={{ textAlign: "center" }}>TOOL CRAWL DATA BY VINH QUANG</h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <label>Nhập link</label>
        <input
          type="text"
          onChange={(e) => {
            setLink(e.target.value);
          }}
          value={link}
        />
        <label>Số trường</label>
        <input
          type="number"
          onChange={(e) => {
            setNumber(e.target.value);
          }}
          value={number}
        />
        <label>Tên file</label>
        <input
          type="text"
          onChange={(e) => {
            setName(e.target.value);
          }}
          value={name}
          id="name"
        />
      </div>
      <div
        style={{
          width: "100%",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button onClick={handleClick} style={{ padding: "3px" }}>
          Xác nhận
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {state &&
          items.map((index) => (
            <input
              key={index}
              className={"input" + index}
              onChange={(e) => {
                var meo = [...input];
                meo[index] = e.target.value;
                setInput(meo);
              }}
              style={{ marginRight: "1rem" }}
            />
          ))}
        {state && <button onClick={() => handleCrawlData()}>Crawl data</button>}
      </div>
    </>
  );
};

export default Crawl;
