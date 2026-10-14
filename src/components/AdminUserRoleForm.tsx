"use client";

import { useState } from "react";

import { updateAdminUserRole } from "@/app/actions/admin-users";
import { SubmitButton } from "@/components/SubmitButton";

type AdminUserRoleFormProps = {
  currentAdminId: string;
  userId: string;
  role: "USER" | "ADMIN";
};

export function AdminUserRoleForm({ currentAdminId, userId, role }: AdminUserRoleFormProps) {
  const [nextRole, setNextRole] = useState(role);
  const [isConfirmingSelfDemotion, setIsConfirmingSelfDemotion] = useState(false);
  const isSelfDemotion = currentAdminId === userId && role === "ADMIN" && nextRole === "USER";

  if (isConfirmingSelfDemotion) {
    return (
      <form action={updateAdminUserRole} className="space-y-3 rounded border border-amber-200 bg-amber-50 p-3">
        <input name="userId" type="hidden" value={userId} />
        <input name="role" type="hidden" value="USER" />
        <p className="text-xs font-bold leading-5 text-amber-800">
          自分自身をUSERに変更します。管理画面へ入れなくなる可能性があります。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded border border-stroke/20 bg-panel px-3 py-2 text-xs font-black text-foreground"
            onClick={() => {
              setNextRole(role);
              setIsConfirmingSelfDemotion(false);
            }}
            type="button"
          >
            キャンセル
          </button>
          <SubmitButton
            className="rounded bg-amber-600 px-3 py-2 text-xs font-black text-white disabled:bg-amber-300"
            pendingLabel="変更中..."
          >
            USERに変更する
          </SubmitButton>
        </div>
      </form>
    );
  }

  return (
    <form action={updateAdminUserRole} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input name="userId" type="hidden" value={userId} />
      <select
        className="h-9 rounded border border-stroke/20 bg-panel px-2 text-xs font-bold outline-none focus:border-mint focus:ring-2 focus:ring-mint/20"
        name="role"
        onChange={(event) => setNextRole(event.target.value as "USER" | "ADMIN")}
        value={nextRole}
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {isSelfDemotion ? (
        <button
          className="h-9 rounded bg-amber-600 px-3 text-xs font-black text-white transition hover:bg-amber-700"
          onClick={(event) => {
            event.preventDefault();
            setIsConfirmingSelfDemotion(true);
          }}
          type="button"
        >
          確認する
        </button>
      ) : (
        <SubmitButton
          className="h-9 rounded bg-ink px-3 text-xs font-black text-white transition hover:bg-slate-700 disabled:bg-slate-300"
          disabled={nextRole === role}
          pendingLabel="変更中..."
        >
          変更
        </SubmitButton>
      )}
    </form>
  );
}
