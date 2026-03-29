"use client";

import { useAdminUsers } from "@/hooks/auth/useAdmin";
import { useUser } from "@/hooks/auth/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Shield,
  UserCheck,
  UserX,
  UserCog,
  Loader2,
  Check,
} from "lucide-react";

export default function AdminUsersPage() {
  const { users, isLoading, error, toggleUserStatus, assignRole } = useAdminUsers();
  const { user: currentUser } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-semibold">Failed to load users</h2>
        <p className="text-muted-foreground">
          {error.response?.status === 403 
            ? "You don't have permission to view this page. Please try logging out and back in."
            : error.response?.data?.error || "An unexpected error occurred."}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all registered users, their roles, and account status.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(users) && users.map((user) => {
              const isSelf = Number(user.id) === Number(currentUser?.id);
              
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                          {isSelf && <Badge variant="outline" className="ml-2 text-[10px] h-4">You</Badge>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "default"
                          : user.role === "TEACHER"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive" as any}>
                      {user.isActive ? "Active" : "Deactivated"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={isSelf}
                          className={isSelf ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      {!isSelf && (
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user.id, !user.isActive)}
                            className={user.isActive ? "text-destructive" : "text-success" as any}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate Account
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate Account
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase font-semibold px-2 py-1.5">
                            Assign Role
                          </DropdownMenuLabel>
                          
                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, "STUDENT")}
                            disabled={user.role === "STUDENT"}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <UserCog className="mr-2 h-4 w-4" />
                              Student
                            </div>
                            {user.role === "STUDENT" && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, "TEACHER")}
                            disabled={user.role === "TEACHER"}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <UserCog className="mr-2 h-4 w-4" />
                              Teacher
                            </div>
                            {user.role === "TEACHER" && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            onClick={() => assignRole(user.id, "ADMIN")}
                            disabled={user.role === "ADMIN"}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              Admin
                            </div>
                            {user.role === "ADMIN" && <Check className="h-4 w-4 text-primary" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
