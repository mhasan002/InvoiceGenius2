import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Trash2, UserPlus, Filter, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  canCreateInvoices: string;
  canDeleteInvoices: string;
  canManageServices: string;
  canManageCompanyProfiles: string;
  canManagePaymentMethods: string;
  canManageTemplates: string;
  canViewOnlyAssignedInvoices: string;
  canManageTeamMembers: string;
  isActive: string;
  createdAt: string;
}

interface EditMemberForm {
  email?: string;
  fullName?: string;
  role?: string;
  password?: string;
  canCreateInvoices?: boolean;
  canDeleteInvoices?: boolean;
  canManageServices?: boolean;
  canManageCompanyProfiles?: boolean;
  canManagePaymentMethods?: boolean;
  canManageTemplates?: boolean;
  canViewOnlyAssignedInvoices?: boolean;
  canManageTeamMembers?: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  platform?: string;
  createdBy?: string;
  createdAt: string;
  status: string;
}

const permissionLabels = {
  canCreateInvoices: "Can create invoices",
  canDeleteInvoices: "Can delete invoices", 
  canManageServices: "Can manage services/packages",
  canManageCompanyProfiles: "Can manage company profiles",
  canManagePaymentMethods: "Can manage payment methods",
  canManageTemplates: "Can view and change templates",
  canViewOnlyAssignedInvoices: "Can view only assigned invoices",
  canManageTeamMembers: "Can manage other team members (Team Access)",
};

export default function TeamPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filterMember, setFilterMember] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Form states
  const [newMember, setNewMember] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "Member",
    canCreateInvoices: false,
    canDeleteInvoices: false,
    canManageServices: false,
    canManageCompanyProfiles: false,
    canManagePaymentMethods: false,
    canManageTemplates: false,
    canViewOnlyAssignedInvoices: false,
    canManageTeamMembers: false,
  });

  const [editMember, setEditMember] = useState<EditMemberForm>({});

  // Fetch team members
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["/api/team-members"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/team-members");
      return res.json();
    }
  });

  // Fetch invoices for activity tracking
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/invoices");
      return res.json();
    }
  });

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/team-members", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsAddDialogOpen(false);
      setNewMember({
        email: "",
        password: "",
        fullName: "",
        role: "Member",
        canCreateInvoices: false,
        canDeleteInvoices: false,
        canManageServices: false,
        canManageCompanyProfiles: false,
        canManagePaymentMethods: false,
        canManageTemplates: false,
        canViewOnlyAssignedInvoices: false,
        canManageTeamMembers: false,
      });
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  // Update team member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/team-members/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      setEditMember({});
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  // Delete team member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/team-members/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const handleSubmitNewMember = () => {
    if (!newMember.email || !newMember.password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    // Send boolean values directly - the API schema will handle the transformation
    createMemberMutation.mutate(newMember);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditMember({
      email: member.email,
      fullName: member.fullName,
      role: member.role,
      canCreateInvoices: member.canCreateInvoices === "true",
      canDeleteInvoices: member.canDeleteInvoices === "true",
      canManageServices: member.canManageServices === "true",
      canManageCompanyProfiles: member.canManageCompanyProfiles === "true",
      canManagePaymentMethods: member.canManagePaymentMethods === "true",
      canManageTemplates: member.canManageTemplates === "true",
      canViewOnlyAssignedInvoices: member.canViewOnlyAssignedInvoices === "true",
      canManageTeamMembers: member.canManageTeamMembers === "true",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitEditMember = () => {
    if (!selectedMember) return;

    // Send boolean values directly - the API schema will handle the transformation
    updateMemberMutation.mutate({
      id: selectedMember.id,
      data: editMember
    });
  };

  const handleViewPermissions = (member: TeamMember) => {
    setSelectedMember(member);
    setIsPermissionsDialogOpen(true);
  };

  const getPermissionCount = (member: TeamMember) => {
    const permissions = [
      member.canCreateInvoices,
      member.canDeleteInvoices,
      member.canManageServices,
      member.canManageCompanyProfiles,
      member.canManagePaymentMethods,
      member.canManageTemplates,
      member.canViewOnlyAssignedInvoices,
      member.canManageTeamMembers,
    ];
    return permissions.filter(p => p === "true").length;
  };

  const getInvoicesByMember = (memberId: string) => {
    return invoices.filter((invoice: Invoice) => invoice.createdBy === memberId);
  };

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    if (filterMember !== "all" && invoice.createdBy !== filterMember) return false;
    
    if (dateFilter !== "all") {
      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          return invoiceDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return invoiceDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return invoiceDate >= monthAgo;
        default:
          return true;
      }
    }
    
    return true;
  });

  return (
    <DashboardLayout 
      title="Team Management" 
      description="Add and manage users with custom permissions and invoice activity tracking."
    >
      <div className="space-y-6">

        {/* Add Team Member Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Team Member
            </CardTitle>
            <CardDescription>
              Create a new team member account with custom access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="teammate@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newMember.password}
                          onChange={(e) => setNewMember(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Secure password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={newMember.fullName}
                          onChange={(e) => setNewMember(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role Label</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Access Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Access Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(permissionLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={newMember[key as keyof typeof newMember] as boolean}
                            onCheckedChange={(checked) => 
                              setNewMember(prev => ({ ...prev, [key]: checked }))
                            }
                          />
                          <Label htmlFor={key} className="text-sm font-normal">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitNewMember}
                      disabled={createMemberMutation.isPending}
                    >
                      {createMemberMutation.isPending ? "Adding..." : "Add Team Member"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <div className="text-center py-8">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members added yet. Add your first team member to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invoices Created</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member: TeamMember) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.fullName || "—"}
                        {member.isActive === "false" && (
                          <Badge variant="secondary" className="ml-2">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>{getInvoicesByMember(member.id).length}</TableCell>
                      <TableCell>{format(new Date(member.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPermissions(member)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View ({getPermissionCount(member)})
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.fullName || member.email}? 
                                  This will revoke their access but their invoice history will be preserved.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMemberMutation.mutate(member.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Invoice Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Invoice Activity Filter
            </CardTitle>
            <CardDescription>
              Track invoice creation by team members with filtering options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="filter-member">Filter by Member</Label>
                <Select value={filterMember} onValueChange={setFilterMember}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {teamMembers.map((member: TeamMember) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.fullName || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="filter-date">Filter by Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found for the selected filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => {
                    const creator = teamMembers.find((member: TeamMember) => member.id === invoice.createdBy);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{invoice.platform || "—"}</TableCell>
                        <TableCell>{creator?.fullName || creator?.email || "Unknown"}</TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={invoice.status === "draft" ? "secondary" : "default"}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editMember.email || ""}
                      onChange={(e) => setEditMember(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">New Password (optional)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editMember.password || ""}
                      onChange={(e) => setEditMember(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Leave empty to keep current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-fullName">Full Name</Label>
                    <Input
                      id="edit-fullName"
                      value={editMember.fullName || ""}
                      onChange={(e) => setEditMember(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role Label</Label>
                    <Select
                      value={editMember.role || "Member"}
                      onValueChange={(value) => setEditMember(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Access Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Access Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${key}`}
                        checked={Boolean(editMember[key as keyof typeof editMember]) || false}
                        onCheckedChange={(checked) => 
                          setEditMember(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                      <Label htmlFor={`edit-${key}`} className="text-sm font-normal">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitEditMember}
                  disabled={updateMemberMutation.isPending}
                >
                  {updateMemberMutation.isPending ? "Updating..." : "Update Team Member"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Permissions Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Permissions for {selectedMember?.fullName || selectedMember?.email}
              </DialogTitle>
              <DialogDescription>
                View all access permissions assigned to this team member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMember && Object.entries(permissionLabels).map(([key, label]) => {
                const hasPermission = selectedMember[key as keyof TeamMember] === "true";
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Badge variant={hasPermission ? "default" : "secondary"}>
                      {hasPermission ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}