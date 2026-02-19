import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

/** 工具：把姓名陣列轉成顯示字串 */
function formatNames(names) {
  const cleaned = (names || []).map((s) => (s || "").trim()).filter(Boolean);
  return cleaned.length ? cleaned.join("、") : "";
}

function ReceiptCopy({
  copyLabel,
  serial,
  names,
  address,
  amount,
  reasonText,
  today,
  customers,
  purposes,
  otherEnabled,
  otherText,
  setSerial,
  setNameAt,
  addNameRow,
  removeNameRow,
  setAddress,
  setAmount,
  togglePurpose,
  setOtherEnabled,
  setOtherText,
  setAddressTouched,
}) {
  const printedNames = formatNames(names);

  return (
    <div className="copy">
      {/* 抬頭列 */}
      <div className="topbar">
        <div className="topbar-title red">量無德功字扇施佈</div>

        <div className="topbar-right">
          <div className="copy-label red">{copyLabel}</div>

          <div className="serial">
            <input
              className="screen-only input input-serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
            />
            <span className="print-only red">{serial}</span>
          </div>
        </div>
      </div>

      {/* 兩欄：紅框 + 框外文字 */}
      <div className="frame-row">
        {/* 紅框 */}
        <div className="frame">
          {/* 框內右側直排大字 */}
          <div className="v-right red">
            <div className="v-big">感謝狀</div>
          </div>

          {/* 左側欄位 */}
          <div className="left">
            {/* ✅ 姓名（複數，可輸入 + 下拉） */}
            <div className="field names-field">
              <div className="label red v">姓名</div>

              {/* 螢幕：多列 input（可輸入 + 下拉） */}
              <div className="screen-only names-editor">
                {names.map((val, idx) => (
                  <div key={idx} className="name-row">
                    <input
                      className="input"
                      list="nameList"
                      value={val}
                      onChange={(e) => setNameAt(idx, e.target.value)}
                      placeholder={`姓名 ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => removeNameRow(idx)}
                      disabled={names.length <= 1}
                      title="刪除此姓名"
                    >
                      −
                    </button>
                  </div>
                ))}

                <datalist id="nameList">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>

                <button type="button" className="mini-btn add-btn" onClick={addNameRow}>
                  + 新增姓名
                </button>
              </div>

              {/* 列印：把所有姓名串起來 */}
              <div className="print-only v-fill blue">
                {printedNames || "＿＿＿＿"}
              </div>
            </div>

            {/* 住址（✅ 選名字會自動帶入；手動改會鎖住不覆蓋） */}
            <div className="field">
              <div className="label red v">住址</div>

              <input
                className="screen-only input"
                value={address}
                onChange={(e) => {
                  setAddressTouched(true);
                  setAddress(e.target.value);
                }}
                placeholder="輸入住址"
              />

              <div className="print-only v-fill blue">
                {address || "＿＿＿＿"}
              </div>
            </div>

            {/* ✅ 用途（含其他） */}
            <div className="field purpose-field">
              <div className="label red v">用途</div>

              {/* 螢幕：checkbox + 其他輸入 */}
              <div className="screen-only purpose-list">
                {purposes.map((p) => (
                  <label key={p.key} className="purpose-item">
                    <input
                      type="checkbox"
                      checked={p.checked}
                      onChange={() => togglePurpose(p.key)}
                    />
                    {p.label}
                  </label>
                ))}

                <label className="purpose-item">
                  <input
                    type="checkbox"
                    checked={otherEnabled}
                    onChange={(e) => setOtherEnabled(e.target.checked)}
                  />
                  其他
                </label>

                {otherEnabled ? (
                  <input
                    className="input other-input"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="請輸入其他用途"
                  />
                ) : null}
              </div>

              {/* 列印：方框 + ✓ */}
              <div className="print-only purpose-print blue">
                {purposes.map((p) => (
                  <div key={p.key} className="purpose-print-item">
                    <span className="box">{p.checked ? "✓" : ""}</span>
                    <span>{p.label}</span>
                  </div>
                ))}

                <div className="purpose-print-item purpose-other">
                  <span className="box">{otherEnabled ? "✓" : ""}</span>
                  <span>其他：</span>
                  <span className="other-line">
                    {otherEnabled ? (otherText || "＿＿＿＿") : "＿＿＿＿"}
                  </span>
                </div>
              </div>
            </div>

            {/* 金額 */}
            <div className="field">
              <div className="label red v">金額</div>

              <input
                className="screen-only input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如 500"
              />

              <div className="print-only v-fill blue">
                {amount ? `${amount} 元整` : "＿＿＿＿"}
              </div>
            </div>

            {/* 日期 */}
            <div className="field">
              <div className="label red v">日期</div>
              <div className="v-fill">
                <span className="red">中華民國</span>{" "}
                <span className="blue">
                  {today.y} 年 {today.m} 月 {today.day} 日
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 框外右側直排文字 */}
        <div className="outside-col red">
          <div className="outside-text">{reasonText}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // ✅ Supabase customers
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // 讀取 customers（id, name, address）
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, address")
        .order("id", { ascending: false });

      if (error) throw error;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchCustomers failed:", err);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const [serial, setSerial] = useState("01453");

  // ✅ 多人姓名（至少 1 個欄位）
  const [names, setNames] = useState([""]);

  // ✅ 地址（會被選名字自動帶入）
  const [address, setAddress] = useState("");
  const [addressTouched, setAddressTouched] = useState(false);

  // ✅ 金額
  const [amount, setAmount] = useState("500");

  // ✅ 框外文字
  const [reasonText] = useState("添油添香添福壽");

  // ✅ 用途（可自行增減）
  const [purposes, setPurposes] = useState([
    { key: "light", label: "點燈", checked: false },
    { key: "incense", label: "添香油", checked: false },
    { key: "repair", label: "修繕", checked: false },
    { key: "charity", label: "慈善", checked: false },
  ]);

  const togglePurpose = (key) => {
    setPurposes((prev) =>
      prev.map((p) => (p.key === key ? { ...p, checked: !p.checked } : p))
    );
  };

  // ✅ 其他用途
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [otherText, setOtherText] = useState("");

  // ✅ 民國日期
  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear() - 1911, m: d.getMonth() + 1, day: d.getDate() };
  }, []);

  /** ✅ 依姓名從 customers 自動帶入地址（完全相符才帶入） */
  const fillAddressByName = (name) => {
    const key = (name || "").trim().toLowerCase();
    if (!key) return;

    const matched = customers.find(
      (c) => (c.name || "").trim().toLowerCase() === key
    );

    if (matched && matched.address) {
      setAddress(matched.address);
    }
  };

  /** ✅ 設定某一列姓名；若 idx=0 則自動帶入地址 */
  const setNameAt = (idx, value) => {
    setNames((prev) => prev.map((v, i) => (i === idx ? value : v)));

    // 只用第一個姓名當主捐款人：選到資料庫名字→重置 touched 並自動帶地址
    if (idx === 0) {
      setAddressTouched(false);
      fillAddressByName(value);
    }
  };

  const addNameRow = () => setNames((prev) => [...prev, ""]);

  const removeNameRow = (idx) => {
    setNames((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [""];
    });
  };

  return (
    <div className="page">
      {/* 顯示載入提示（僅螢幕） */}
      <div className="screen-only hint">
        {customersLoading ? "姓名名單載入中..." : "（姓名可輸入或從下拉選擇，選到會自動帶地址）"}
      </div>

      {/* 上聯：交付聯 */}
      <ReceiptCopy
        copyLabel="交付聯"
        serial={serial}
        names={names}
        address={address}
        amount={amount}
        reasonText={reasonText}
        today={today}
        customers={customers}
        purposes={purposes}
        otherEnabled={otherEnabled}
        otherText={otherText}
        setSerial={setSerial}
        setNameAt={setNameAt}
        addNameRow={addNameRow}
        removeNameRow={removeNameRow}
        setAddress={setAddress}
        setAmount={setAmount}
        togglePurpose={togglePurpose}
        setOtherEnabled={setOtherEnabled}
        setOtherText={setOtherText}
        setAddressTouched={setAddressTouched}
      />

      {/* 裁切線 */}
      <div className="cut-line">
        <span>✂ 請沿虛線裁切</span>
      </div>

      {/* 下聯：存根聯 */}
      <ReceiptCopy
        copyLabel="存根聯"
        serial={serial}
        names={names}
        address={address}
        amount={amount}
        reasonText={reasonText}
        today={today}
        customers={customers}
        purposes={purposes}
        otherEnabled={otherEnabled}
        otherText={otherText}
        setSerial={setSerial}
        setNameAt={setNameAt}
        addNameRow={addNameRow}
        removeNameRow={removeNameRow}
        setAddress={setAddress}
        setAmount={setAmount}
        togglePurpose={togglePurpose}
        setOtherEnabled={setOtherEnabled}
        setOtherText={setOtherText}
        setAddressTouched={setAddressTouched}
      />

      <button className="screen-only print-btn" onClick={() => window.print()}>
        列印
      </button>
    </div>
  );
}
