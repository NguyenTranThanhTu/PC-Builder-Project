"use client";
import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", retype: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email || !form.password || !form.retype) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (form.password !== form.retype) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        setError("Lỗi máy chủ, dữ liệu trả về không hợp lệ.");
        setLoading(false);
        return;
      }
      if (data && data.ok) {
        setSuccess("Đăng ký thành công! Bạn có thể đăng nhập.");
        setForm({ name: "", email: "", password: "", retype: "" });
      } else {
        setError((data && data.error) || "Đăng ký thất bại.");
      }
    } catch {
      setError("Lỗi máy chủ, vui lòng thử lại sau.");
    }
    setLoading(false);
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Tạo tài khoản mới
              </h2>
              <p>Nhập thông tin bên dưới</p>
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            {success && <div className="text-green-600 text-center mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="mt-5.5">
              <div className="mb-5">
                <label htmlFor="name" className="block mb-2.5">
                  Họ và tên <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Nhập họ và tên"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5">
                  Email <span className="text-red">*</span>
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
                  Mật khẩu <span className="text-red">*</span>
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
              <div className="mb-5.5">
                <label htmlFor="retype" className="block mb-2.5">
                  Nhập lại mật khẩu <span className="text-red">*</span>
                </label>
                <input
                  type="password"
                  name="retype"
                  id="retype"
                  placeholder="Nhập lại mật khẩu"
                  value={form.retype}
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
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
              <p className="text-center mt-6">
                Đã có tài khoản?
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
