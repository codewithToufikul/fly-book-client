import React, { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import useCategories from "../../Hooks/useCategories";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

const AddCategory = () => {
  const { categories, refetch, isLoading, isError, error } = useCategories();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const addCategory = async (e) => {
    e.preventDefault();
    const form = e.target;
    const category = form.category.value;

    try {
      const res = await axiosPublic.post(
        "/admin/category-add",
        { category }, 
        {
          headers: {
            Authorization: `Bearer ${token}`, // Adding token for authentication
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        refetch();
        toast.success("Category added successfully");
        form.reset(); // This will clear the form
      }
    } catch (error) {
      console.error(
        "Error adding category:",
        error.response?.data || error.message
      );
    }
  };
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  const handleDelete = async (id) => {
    try {
      const res = await axiosPublic.delete(`/admin/category-delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",       
        },
      });
      if (res.status === 200) {
        refetch();
        toast.success("Category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error.response?.data || error.message);
    }
  };  
  const handleEdit = async (id) => {
    const category = categories.find(cat => cat._id === id);
    setEditingCategory(category);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedCategory = e.target.editedCategory.value;

    try {
      const res = await axiosPublic.put(
        `/admin/category-update/${editingCategory._id}`,
        { category: updatedCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        refetch();
        toast.success("Category updated successfully");
        setEditModalOpen(false);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error updating category:", error.response?.data || error.message);
      toast.error("Failed to update category");
    }
  };

  return (
    <div className="select-none">
      <div className="flex flex-col lg:flex-row justify-center items-center mt-5">
        <h1 className="text-lg mb-3 lg:text-2xl font-semibold mr-4 select-none pointer-events-none">
          Homepage Category
        </h1>
        <form
          onSubmit={addCategory}
          className="max-w-[300px] border-2 rounded-lg p-2 flex flex-col space-y-2"
        >
          <label className="text-base font-medium text-start select-none pointer-events-none">
            Add Category
          </label>
          <input
            name="category"
            required
            className="p-2 border-2 border-blue-300 rounded-2xl"
            type="text"
          />
          <button type="submit" className="btn bg-blue-600 text-white">
            Add
          </button>
        </form>
      </div>
      <div>
        <ul className="lg:m-5 lg:my-10 pl-5 mt-3 space-y-4">
          {categories?.map((category, index) => (
              <li className="grid grid-cols-4 max-w-[600px]" key={category._id}>
                <p className="col-span-1 text-lg select-none pointer-events-none">{index+1}</p>
                <p className="col-span-2 text-lg select-none pointer-events-none">{category.category}</p>
                 <div className="flex items-center gap-4 col-span-1">
                    <button onClick={()=>handleEdit(category._id)} className="text-2xl text-blue-500">
                      <CiEdit />
                    </button>
                    <button onClick={()=>handleDelete(category._id)} className="text-2xl text-red-500">
                      <MdDeleteForever />
                    </button>
                 </div>   
              </li>
            ))}
        </ul>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-[400px] w-full">
            <h2 className="text-xl font-semibold mb-4 select-none pointer-events-none">Edit Category</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                name="editedCategory"
                defaultValue={editingCategory?.category}
                required
                className="w-full p-2 border-2 border-blue-300 rounded-2xl"
                type="text"
              />
              <div className="flex gap-3">
                <button type="submit" className="btn bg-blue-600 text-white">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn bg-gray-500 text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;
