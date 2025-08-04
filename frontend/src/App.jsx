import React, { useState, useEffect } from "react";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [view, setView] = useState(token ? "posts" : "login");
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    title: "",
    content: "",
  });

  const [editingPostId, setEditingPostId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", content: "" });
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000/api";

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setMessage("Failed to load posts.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful! Please log in.");
        setView("login");
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Error during registration.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setView("posts");
        setMessage("");
        fetchPosts();
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      setMessage("Error during login.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setView("login");
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Post created successfully!");
        setFormData({ ...formData, title: "", content: "" });
        fetchPosts();
      } else {
        setMessage(data.message || "Failed to create post.");
      }
    } catch (error) {
      setMessage("Error creating post.");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/posts/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Post updated successfully!");
        setEditingPostId(null);
        setEditFormData({ title: "", content: "" });
        fetchPosts();
      } else {
        setMessage(data.message || "Failed to update post.");
      }
    } catch (error) {
      setMessage("Error updating post.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Post deleted successfully!");
        fetchPosts();
      } else {
        setMessage(data.message || "Failed to delete post.");
      }
    } catch (error) {
      setMessage("Error deleting post.");
    }
  };

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => setView("register")}
            className="text-blue-500 hover:underline font-medium"
          >
            Register here
          </button>
        </p>
        {message && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => setView("login")}
            className="text-blue-500 hover:underline font-medium"
          >
            Login here
          </button>
        </p>
        {message && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="container mx-auto">
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Social App</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Create a new post
              </h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Post Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  name="content"
                  placeholder="What's on your mind?"
                  rows="6"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                >
                  Post
                </button>
              </form>
              {message && (
                <div className="mt-4 text-center text-green-500 font-medium">
                  {message}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Latest Posts
            </h2>
            <div className="space-y-6">
              {posts
                .slice()
                .reverse()
                .map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-lg shadow-md"
                  >
                    {editingPostId === post.id ? (
                      <form onSubmit={handleUpdatePost}>
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 font-bold text-xl"
                          required
                        />
                        <textarea
                          name="content"
                          rows="4"
                          value={editFormData.content}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                          required
                        />
                        <div className="flex space-x-2 mt-4">
                          <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPostId(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                          <span>
                            Posted by{" "}
                            <span className="font-semibold text-blue-600">
                              {post.authorUsername}
                            </span>{" "}
                            on {new Date(post.date_posted).toLocaleString()}
                          </span>
                          {user && user.id === post.authorId && (
                            <div className="space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditFormData({
                                    title: post.title,
                                    content: post.content,
                                  });
                                }}
                                className="text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  switch (view) {
    case "register":
      return renderRegister();
    case "posts":
      return renderPosts();
    case "login":
    default:
      return renderLogin();
  }
};

export default App;
