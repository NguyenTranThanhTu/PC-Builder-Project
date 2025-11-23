"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

const Signin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (res?.error) {
      setError("Sai email hoặc mật khẩu.");
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
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
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
