// ============================================================
// ADD USER MODAL COMPONENT
// Bounded Context: User Management (Core)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { adminApi } from "../api/adminApi";
import type { Major, AcademicLevel } from "../types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: "student" | "teacher";
  onSuccess?: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  initialRole = "student",
  onSuccess,
}: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: initialRole,
    major: "",
    level: "",
    department: "",
    specialization: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch majors and academic levels when modal opens
      Promise.all([
        adminApi.getMajors().then(setMajors).catch(console.error),
        adminApi.getAcademicLevels().then(setAcademicLevels).catch(console.error),
      ]);
      
      // Reset form when modal opens
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: initialRole,
        major: "",
        level: "",
        department: "",
        specialization: "",
      });
      setError(null);
    }
  }, [isOpen, initialRole]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare user data based on role
      const userData: Record<string, any> = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === "student") {
        if (formData.major) userData.major = formData.major;
        if (formData.level) userData.level = formData.level;
      } else if (formData.role === "teacher") {
        if (formData.department) userData.department = formData.department;
        if (formData.specialization) userData.specialization = formData.specialization;
      }

      // Call the API to create user
      await adminApi.createUser(userData);

      // Success
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create user. Please try again.");
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New {formData.role === "student" ? "Student" : "Teacher"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new user account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="user@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Minimum 8 characters"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Enter full name"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Student Fields */}
          {formData.role === "student" && (
            <>
              <div>
                <label
                  htmlFor="major"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Major
                </label>
                <select
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">Select a major</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.name}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Academic Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">Select a level</option>
                  {academicLevels.map((level) => (
                    <option key={level.id} value={level.name}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Teacher Fields */}
          {formData.role === "teacher" && (
            <>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="e.g., Software Engineering"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create {formData.role === "student" ? "Student" : "Teacher"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
