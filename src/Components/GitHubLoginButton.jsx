import React from "react";

function GitHubLoginButton() {
  const handleLogin = () => {
    // Redirect user to your backend GitHub OAuth route
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 rounded-2xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition"
    >
      Login with GitHub
    </button>
  );
}

export default GitHubLoginButton;