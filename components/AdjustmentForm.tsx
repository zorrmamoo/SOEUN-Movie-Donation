"use client";

import { useRef } from "react";

export default function AdjustmentForm({
  action,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function confirmAdjustment(e: React.FormEvent<HTMLFormElement>) {
    const form = formRef.current;
    if (!form) return;

    const amount = (form.elements.namedItem("amount") as HTMLInputElement)
      .value;
    const type = (form.elements.namedItem("adjustmentType") as RadioNodeList)
      .value;

    const label = type === "subtract" ? "차감" : "추가";

    if (!confirm(`${amount}원을 ${label}하시겠습니까?`)) {
      e.preventDefault();
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="admin-adjustment-box"
      onSubmit={(e) => confirmAdjustment(e)}
    >
      <h2>수동 금액 조정</h2>
      <div className="admin-adjustment-grid">
        <div className="admin-adjustment-section">
          <label htmlFor="adjustment-amount">금액:</label>
          <input
            name="amount"
            type="number"
            min="1"
            className="admin-adjustment-input"
            required
          />

          <div className="admin-adjustment-toggle">
            <input
              type="radio"
              id="adjust-add"
              name="adjustmentType"
              value="add"
              defaultChecked
              hidden
            />
            <label htmlFor="adjust-add" className="toggle-btn">
              +
            </label>

            <input
              type="radio"
              id="adjust-subtract"
              name="adjustmentType"
              value="subtract"
              hidden
            />
            <label htmlFor="adjust-subtract" className="toggle-btn">
              -
            </label>
          </div>
        </div>

        <div className="admin-adjustment-section">
          <label htmlFor="adjustment-reason">사유:</label>
          <input name="reason" type="text" className="admin-adjustment-input" />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        조정
      </button>
    </form>
  );
}
