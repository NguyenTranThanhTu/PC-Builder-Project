"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  position: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export default function BannerManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"banners" | "logo">("banners");

  // Form states for banner
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "",
    position: "hero",
    isActive: true,
    order: 0,
  });

  // Logo form
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/");
    } else {
      fetchBanners();
      fetchSettings();
    }
  }, [status, session, router]);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const settingsMap = data.reduce((acc: any, s: SiteSetting) => {
          acc[s.key] = s.value;
          return acc;
        }, {});
        setSettings(settingsMap);
        setLogoUrl(settingsMap.logo_url || "/images/logo/logo.svg");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/admin/banners/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchBanners();
          resetForm();
          alert("Banner updated successfully!");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchBanners();
          resetForm();
          setIsCreating(false);
          alert("Banner created successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to save banner:", error);
      alert("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchBanners();
        alert("Banner deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete banner:", error);
      alert("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      buttonText: banner.buttonText || "",
      position: banner.position,
      isActive: banner.isActive,
      order: banner.order,
    });
    setEditingId(banner.id);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "",
      position: "hero",
      isActive: true,
      order: 0,
    });
    setEditingId(null);
  };

  const handleSaveLogo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "logo_url", value: logoUrl }),
      });
      if (res.ok) {
        alert("Logo updated successfully!");
        await fetchSettings();
      }
    } catch (error) {
      console.error("Failed to save logo:", error);
      alert("Failed to save logo");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Banner & Logo Management
        </h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("banners")}
              className={`${
                activeTab === "banners"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Banners
            </button>
            <button
              onClick={() => setActiveTab("logo")}
              className={`${
                activeTab === "logo"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Logo
            </button>
          </nav>
        </div>

        {/* Banner Tab */}
        {activeTab === "banners" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Hero Banners</h2>
              <button
                onClick={() => {
                  setIsCreating(!isCreating);
                  resetForm();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {isCreating ? "Cancel" : "Create New Banner"}
              </button>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingId ? "Edit Banner" : "Create New Banner"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData({ ...formData, subtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="e.g., /images/hero/banner1.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link URL
                      </label>
                      <input
                        type="text"
                        value={formData.linkUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, linkUrl: e.target.value })
                        }
                        placeholder="e.g., /shop-with-sidebar?category=gpu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buttonText: e.target.value,
                          })
                        }
                        placeholder="e.g., Shop Now"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="hero">Hero</option>
                        <option value="promo">Promo</option>
                        <option value="sidebar">Sidebar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : editingId ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsCreating(false);
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Banners List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-24 h-16">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {banner.title}
                        </div>
                        {banner.subtitle && (
                          <div className="text-sm text-gray-500">
                            {banner.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {banner.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            banner.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {banners.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No banners yet. Create your first banner above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === "logo" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Site Logo</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Logo
                </label>
                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                  <Image
                    src={logoUrl}
                    alt="Site Logo"
                    width={200}
                    height={50}
                    className="max-h-16 w-auto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="e.g., /images/logo/logo.svg"
                  className="w-full max-w-xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload your logo to /public/images/logo/ and enter the path here
                </p>
              </div>

              <button
                onClick={handleSaveLogo}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Logo"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
