import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsersForAdmin,
  updateUserRole,
  deleteUser,
} from "@/store/admin/user-slice";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";

function AdminUsersView() {
  const { userList, isLoading } = useSelector((state) => state.adminUser);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getAllUsersForAdmin());
  }, [dispatch]);

  function handleToggleRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    dispatch(updateUserRole({ id: userId, role: newRole })).then((data) => {
      if (data?.payload?.success) {
        dispatch(getAllUsersForAdmin());
        toast({
          title: "User role updated successfully",
          description: `User is now an ${newRole}`,
        });
      }
    });
  }

  function handleDeleteUser(userId) {
    if (window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) {
      dispatch(deleteUser(userId)).then((data) => {
        if (data?.payload?.success) {
          dispatch(getAllUsersForAdmin());
          toast({
            title: "User deleted successfully",
          });
        }
      });
    }
  }

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList && userList.length > 0
              ? userList.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>{userItem?.id}</TableCell>
                    <TableCell className="font-semibold">{userItem?.userName}</TableCell>
                    <TableCell>{userItem?.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          userItem?.role === "admin"
                            ? "bg-primary"
                            : "bg-primary"
                        }`}
                      >
                        {userItem?.role?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2 items-center">
                      <Button
                        onClick={() =>
                          handleToggleRole(userItem?.id, userItem?.role)
                        }
                        className="bg-background text-foreground border border-primary-border/20 hover:bg-primary/10"
                        size="sm"
                      >
                        {userItem?.role === "admin" ? "Demote to User" : "Make Admin"}
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(userItem?.id)}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:text-red-600 transition-colors"
                        size="sm"
                      >
                        Delete User
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminUsersView;
