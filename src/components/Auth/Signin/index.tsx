"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

const Signin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannedReason, setBannedReason] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBannedReason("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (res?.error) {
      // Check if error is about banned account
      if (res.error.startsWith("BANNED:")) {
        const reason = res.error.replace("BANNED:", "");
        setBannedReason(reason);
      } else {
        setError("Sai email hoặc mật khẩu.");
      }
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <>
      <Breadcrumb title={"Đăng nhập"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đăng nhập tài khoản
              </h2>
              <p>Nhập thông tin bên dưới</p>
            </div>
            
            {/* Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-light-5 border-l-4 border-red rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-dark font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Banned Account Alert */}
            {bannedReason && (
              <div className="mb-6 p-5 bg-red-light-5 border-2 border-red rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-light-4 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-dark text-base mb-1">🚫 Tài khoản đã bị khóa</h3>
                    <p className="text-sm text-dark-2 mb-3">
                      Tài khoản của bạn đã bị quản trị viên khóa vì lý do sau:
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-red-light-3">
                      <p className="text-sm font-medium text-dark">{bannedReason}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-dark-3 mt-3">
                  💡 Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ để được giải quyết.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="on"
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
              <p className="text-center mt-6">
                Chưa có tài khoản?
                <Link
                  href="/signup"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Đăng ký ngay!
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
