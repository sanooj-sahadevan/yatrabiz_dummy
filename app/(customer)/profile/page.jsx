"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MdEdit, MdLock } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProfileModal } from "@/components/user/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/user/profile/ChangePasswordModal";
import {Card,CardContent,CardHeader,CardTitle,CardFooter,} from "@/components/ui/card";

export default function ProfilePage() {
  const { user, isInitializing, setUser } = useAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const router = useRouter();

  const handleProfileUpdate = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  if (isInitializing) {
    return (
      <LoadingSpinner message="Loading your profile..." fullScreen={true} />
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-1 bg-background">
      <div className="w-full max-w-7xl mx-auto rounded-t-3xl bg-background-alt shadow-lg p-2 md:p-6">
        <div className="flex items-center justify-between mb-4 relative">
          <div className="min-w-[180px] ml-4">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Profile" }]}
            />
          </div>
          <h1 className="heading text-3xl font-bold text-center flex-1">
            Profile
          </h1>
          <div className="min-w-[180px]"></div>
        </div>

        <Card className="max-w-lg mx-auto bg-white border-none shadow-xl rounded-2xl p-8">
          <CardHeader className="flex flex-col items-center border-b pb-6">
            <Avatar className="h-24 w-24 mb-4 shadow-lg">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
              />
              <AvatarFallback className="text-3xl">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {user.name}
            </CardTitle>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Welcome to your personal account dashboard.
            </p>
          </CardHeader>
          <CardContent className="py-6">
            <div className="space-y-4 text-base text-gray-800">
              <div>
                <p className="font-semibold text-gray-600">Full Name</p>
                <p>{user.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600">Email Address</p>
                <p>{user.email}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col justify-center gap-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
              <Button
                className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
                onClick={() => setEditModalOpen(true)}
              >
                <MdEdit size={20} />
                Edit Details
              </Button>
              <Button
                className="w-full sm:w-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow"
                variant="outline"
                onClick={() => setPasswordModalOpen(true)}
              >
                <MdLock size={20} />
                Change Password
              </Button>
            </div>
            <p className="w-full text-center text-xs text-gray-400 mt-4">
              Your information is kept private and secure. Please keep your
              details up to date.
            </p>
          </CardFooter>
        </Card>
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={user}
          onUpdate={handleProfileUpdate}
        />
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          user={user}
        />
      </div>
    </div>
  );
}
