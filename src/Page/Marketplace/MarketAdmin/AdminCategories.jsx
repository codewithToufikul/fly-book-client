import React, { useEffect, useState } from "react";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const AdminCategories = () => {
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.get("/get-product-categories");
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      return toast.error("Category name is required!");
    }
    try {
      const res = await axiosPublic.post(
        "/add-admin-category",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category added successfully!");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category!");
    }
  };

  // ✅ Start editing
  const startEdit = (id, name) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
  };

  // ✅ Update category
  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      return toast.error("Category name cannot be empty!");
    }
    try {
      await axiosPublic.put(
        `/update-admin-category/${editCategoryId}`,
        { name: editCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category updated successfully!");
      setEditCategoryId(null);
      setEditCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update category!");
    }
  };

  // ✅ Delete category
const handleDeleteCategory = async (id) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This category will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axiosPublic.delete(`/delete-admin-category/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire("Deleted!", "Category has been deleted.", "success");
        fetchCategories();
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to delete category!", "error");
      }
    }
  });
};

  if (loading) {
    return <p className="text-center py-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      {/* ✅ Add Category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button
          onClick={handleAddCategory}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
        >
          Add
        </button>
      </div>

      {/* ✅ Categories List */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Category Name</th>
              <th className="p-3 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <tr key={cat._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    {editCategoryId === cat._id ? (
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="border px-2 py-1 rounded-lg w-full"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editCategoryId === cat._id ? (
                      <>
                        <button
                          onClick={handleUpdateCategory}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditCategoryId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat._id, cat.name)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
