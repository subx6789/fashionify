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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList && userList.length > 0
              ? userList.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center overflow-hidden font-bold">
                          <img 
                            src={`https://api.dicebear.com/9.x/micah/svg?seed=${userItem?.avatar || userItem?.userName || "Fashion"}&backgroundColor=transparent`}
                            alt={userItem?.userName} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{userItem?.userName}</p>
                          <p className="text-xs text-muted-foreground">ID: {userItem?.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{userItem?.email}</TableCell>
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
                    <TableCell className="text-right font-medium">
                      {userItem?.orderCount || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                      ₹{(userItem?.totalSpend || 0).toFixed(2)}
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
