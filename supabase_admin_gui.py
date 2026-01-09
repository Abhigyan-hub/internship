"""
Supabase Room Finder - Admin GUI
A Python GUI application to perform CRUD operations on the Supabase rooms database.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from supabase import create_client, Client
import os
from typing import Optional, List, Dict
from datetime import datetime

class SupabaseAdminGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Supabase Room Finder - Admin Panel")
        self.root.geometry("1200x800")
        self.root.configure(bg="#f5f5f5")
        
        self.supabase: Optional[Client] = None
        self.current_room_id: Optional[str] = None
        
        # Create main container
        self.setup_ui()
        
    def setup_ui(self):
        # Header frame
        header_frame = tk.Frame(self.root, bg="#1e319e", height=80)
        header_frame.pack(fill=tk.X, padx=0, pady=0)
        header_frame.pack_propagate(False)
        
        title_label = tk.Label(
            header_frame,
            text="🏠 Room Finder - Database Admin",
            font=("Arial", 20, "bold"),
            bg="#1e319e",
            fg="white"
        )
        title_label.pack(pady=20)
        
        # Connection frame
        conn_frame = tk.Frame(self.root, bg="#f5f5f5", padx=20, pady=10)
        conn_frame.pack(fill=tk.X)
        
        tk.Label(conn_frame, text="Supabase URL:", font=("Arial", 10), bg="#f5f5f5").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.url_entry = tk.Entry(conn_frame, width=50, font=("Arial", 10))
        self.url_entry.grid(row=0, column=1, padx=5, pady=5)
        self.url_entry.insert(0, os.getenv("SUPABASE_URL", ""))
        
        tk.Label(conn_frame, text="Supabase Key:", font=("Arial", 10), bg="#f5f5f5").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.key_entry = tk.Entry(conn_frame, width=50, font=("Arial", 10), show="*")
        self.key_entry.grid(row=1, column=1, padx=5, pady=5)
        self.key_entry.insert(0, os.getenv("SUPABASE_KEY", ""))
        
        connect_btn = tk.Button(
            conn_frame,
            text="Connect",
            command=self.connect_to_supabase,
            bg="#1e319e",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            pady=5,
            cursor="hand2"
        )
        connect_btn.grid(row=0, column=2, rowspan=2, padx=10, pady=5)
        
        # Main content frame
        main_frame = tk.Frame(self.root, bg="#f5f5f5")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Left panel - Room list
        left_panel = tk.Frame(main_frame, bg="white", relief=tk.RAISED, borderwidth=1)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        list_header = tk.Frame(left_panel, bg="#1e319e", height=40)
        list_header.pack(fill=tk.X)
        tk.Label(
            list_header,
            text="Rooms List",
            font=("Arial", 12, "bold"),
            bg="#1e319e",
            fg="white"
        ).pack(pady=10)
        
        # Treeview for room list
        tree_frame = tk.Frame(left_panel)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        scrollbar_y = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL)
        scrollbar_x = ttk.Scrollbar(tree_frame, orient=tk.HORIZONTAL)
        
        self.room_tree = ttk.Treeview(
            tree_frame,
            columns=("ID", "Title", "Location", "Price", "Type"),
            show="headings",
            yscrollcommand=scrollbar_y.set,
            xscrollcommand=scrollbar_x.set,
            selectmode=tk.BROWSE
        )
        
        scrollbar_y.config(command=self.room_tree.yview)
        scrollbar_x.config(command=self.room_tree.xview)
        
        # Configure columns
        self.room_tree.heading("ID", text="ID")
        self.room_tree.heading("Title", text="Title")
        self.room_tree.heading("Location", text="Location")
        self.room_tree.heading("Price", text="Price")
        self.room_tree.heading("Type", text="Type")
        
        self.room_tree.column("ID", width=100)
        self.room_tree.column("Title", width=200)
        self.room_tree.column("Location", width=150)
        self.room_tree.column("Price", width=100)
        self.room_tree.column("Type", width=100)
        
        self.room_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)
        scrollbar_x.pack(side=tk.BOTTOM, fill=tk.X)
        
        self.room_tree.bind("<<TreeviewSelect>>", self.on_room_select)
        
        # Refresh button
        refresh_btn = tk.Button(
            left_panel,
            text="🔄 Refresh List",
            command=self.load_rooms,
            bg="#0284c7",
            fg="white",
            font=("Arial", 10),
            padx=10,
            pady=5,
            cursor="hand2"
        )
        refresh_btn.pack(pady=10)
        
        # Right panel - Form
        right_panel = tk.Frame(main_frame, bg="white", relief=tk.RAISED, borderwidth=1)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        form_header = tk.Frame(right_panel, bg="#1e319e", height=40)
        form_header.pack(fill=tk.X)
        tk.Label(
            form_header,
            text="Room Details",
            font=("Arial", 12, "bold"),
            bg="#1e319e",
            fg="white"
        ).pack(pady=10)
        
        # Form fields
        form_content = tk.Frame(right_panel, bg="white", padx=20, pady=20)
        form_content.pack(fill=tk.BOTH, expand=True)
        
        # Title
        tk.Label(form_content, text="Title *", font=("Arial", 10, "bold"), bg="white").grid(row=0, column=0, sticky="w", pady=5)
        self.title_entry = tk.Entry(form_content, width=40, font=("Arial", 10))
        self.title_entry.grid(row=0, column=1, pady=5, padx=10)
        
        # Location
        tk.Label(form_content, text="Location *", font=("Arial", 10, "bold"), bg="white").grid(row=1, column=0, sticky="w", pady=5)
        self.location_entry = tk.Entry(form_content, width=40, font=("Arial", 10))
        self.location_entry.grid(row=1, column=1, pady=5, padx=10)
        
        # Rent Price
        tk.Label(form_content, text="Rent Price *", font=("Arial", 10, "bold"), bg="white").grid(row=2, column=0, sticky="w", pady=5)
        self.price_entry = tk.Entry(form_content, width=40, font=("Arial", 10))
        self.price_entry.grid(row=2, column=1, pady=5, padx=10)
        
        # Property Type
        tk.Label(form_content, text="Property Type *", font=("Arial", 10, "bold"), bg="white").grid(row=3, column=0, sticky="w", pady=5)
        self.property_type_combo = ttk.Combobox(form_content, width=37, font=("Arial", 10), state="readonly")
        self.property_type_combo["values"] = ("1 BHK", "2 BHK", "1 Bed", "2 Bed", "3 Bed")
        self.property_type_combo.grid(row=3, column=1, pady=5, padx=10)
        
        # Tenant Preference
        tk.Label(form_content, text="Tenant Preference *", font=("Arial", 10, "bold"), bg="white").grid(row=4, column=0, sticky="w", pady=5)
        self.tenant_combo = ttk.Combobox(form_content, width=37, font=("Arial", 10), state="readonly")
        self.tenant_combo["values"] = ("Bachelor", "Family", "Girls", "Working")
        self.tenant_combo.grid(row=4, column=1, pady=5, padx=10)
        
        # Contact Number
        tk.Label(form_content, text="Contact Number *", font=("Arial", 10, "bold"), bg="white").grid(row=5, column=0, sticky="w", pady=5)
        self.contact_entry = tk.Entry(form_content, width=40, font=("Arial", 10))
        self.contact_entry.grid(row=5, column=1, pady=5, padx=10)
        
        # Description
        tk.Label(form_content, text="Description", font=("Arial", 10, "bold"), bg="white").grid(row=6, column=0, sticky="nw", pady=5)
        self.description_text = scrolledtext.ScrolledText(form_content, width=40, height=5, font=("Arial", 10))
        self.description_text.grid(row=6, column=1, pady=5, padx=10)
        
        # Owner ID
        tk.Label(form_content, text="Owner ID *", font=("Arial", 10, "bold"), bg="white").grid(row=7, column=0, sticky="w", pady=5)
        self.owner_id_entry = tk.Entry(form_content, width=40, font=("Arial", 10))
        self.owner_id_entry.grid(row=7, column=1, pady=5, padx=10)
        
        # Buttons frame
        button_frame = tk.Frame(right_panel, bg="white", pady=20)
        button_frame.pack(fill=tk.X)
        
        self.create_btn = tk.Button(
            button_frame,
            text="➕ Create",
            command=self.create_room,
            bg="#10b981",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            pady=8,
            cursor="hand2"
        )
        self.create_btn.pack(side=tk.LEFT, padx=5)
        
        self.update_btn = tk.Button(
            button_frame,
            text="✏️ Update",
            command=self.update_room,
            bg="#0284c7",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            pady=8,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.update_btn.pack(side=tk.LEFT, padx=5)
        
        self.delete_btn = tk.Button(
            button_frame,
            text="🗑️ Delete",
            command=self.delete_room,
            bg="#ef4444",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            pady=8,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.delete_btn.pack(side=tk.LEFT, padx=5)
        
        clear_btn = tk.Button(
            button_frame,
            text="🔄 Clear Form",
            command=self.clear_form,
            bg="#6b7280",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            pady=8,
            cursor="hand2"
        )
        clear_btn.pack(side=tk.LEFT, padx=5)
        
    def connect_to_supabase(self):
        url = self.url_entry.get().strip()
        key = self.key_entry.get().strip()
        
        if not url or not key:
            messagebox.showerror("Error", "Please enter both Supabase URL and Key")
            return
        
        try:
            self.supabase = create_client(url, key)
            messagebox.showinfo("Success", "Connected to Supabase successfully!")
            self.load_rooms()
        except Exception as e:
            messagebox.showerror("Connection Error", f"Failed to connect: {str(e)}")
            self.supabase = None
    
    def load_rooms(self):
        if not self.supabase:
            messagebox.showwarning("Warning", "Please connect to Supabase first")
            return
        
        # Clear existing items
        for item in self.room_tree.get_children():
            self.room_tree.delete(item)
        
        try:
            response = self.supabase.table("rooms").select("*").order("created_at", desc=True).execute()
            
            for room in response.data:
                self.room_tree.insert(
                    "",
                    tk.END,
                    values=(
                        room.get("id", "")[:8] + "...",
                        room.get("title", ""),
                        room.get("location", ""),
                        f"₹{room.get('rent_price', 0)}",
                        room.get("property_type", "")
                    ),
                    tags=(room.get("id"),)
                )
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load rooms: {str(e)}")
    
    def on_room_select(self, event):
        selection = self.room_tree.selection()
        if not selection:
            return
        
        item = self.room_tree.item(selection[0])
        room_id = item["tags"][0] if item["tags"] else None
        
        if not room_id or not self.supabase:
            return
        
        try:
            response = self.supabase.table("rooms").select("*").eq("id", room_id).single().execute()
            room = response.data
            
            self.current_room_id = room_id
            self.title_entry.delete(0, tk.END)
            self.title_entry.insert(0, room.get("title", ""))
            
            self.location_entry.delete(0, tk.END)
            self.location_entry.insert(0, room.get("location", ""))
            
            self.price_entry.delete(0, tk.END)
            self.price_entry.insert(0, str(room.get("rent_price", "")))
            
            self.property_type_combo.set(room.get("property_type", ""))
            self.tenant_combo.set(room.get("tenant_preference", ""))
            
            self.contact_entry.delete(0, tk.END)
            self.contact_entry.insert(0, room.get("contact_number", ""))
            
            self.description_text.delete("1.0", tk.END)
            self.description_text.insert("1.0", room.get("description", ""))
            
            self.owner_id_entry.delete(0, tk.END)
            self.owner_id_entry.insert(0, room.get("owner_id", ""))
            
            # Enable update and delete buttons
            self.update_btn.config(state=tk.NORMAL)
            self.delete_btn.config(state=tk.NORMAL)
            self.create_btn.config(state=tk.DISABLED)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load room details: {str(e)}")
    
    def clear_form(self):
        self.current_room_id = None
        self.title_entry.delete(0, tk.END)
        self.location_entry.delete(0, tk.END)
        self.price_entry.delete(0, tk.END)
        self.property_type_combo.set("")
        self.tenant_combo.set("")
        self.contact_entry.delete(0, tk.END)
        self.description_text.delete("1.0", tk.END)
        self.owner_id_entry.delete(0, tk.END)
        
        # Reset button states
        self.create_btn.config(state=tk.NORMAL)
        self.update_btn.config(state=tk.DISABLED)
        self.delete_btn.config(state=tk.DISABLED)
        
        # Clear selection
        for item in self.room_tree.selection():
            self.room_tree.selection_remove(item)
    
    def validate_form(self) -> bool:
        if not self.title_entry.get().strip():
            messagebox.showerror("Validation Error", "Title is required")
            return False
        if not self.location_entry.get().strip():
            messagebox.showerror("Validation Error", "Location is required")
            return False
        if not self.price_entry.get().strip():
            messagebox.showerror("Validation Error", "Rent Price is required")
            return False
        try:
            float(self.price_entry.get().strip())
        except ValueError:
            messagebox.showerror("Validation Error", "Rent Price must be a number")
            return False
        if not self.property_type_combo.get():
            messagebox.showerror("Validation Error", "Property Type is required")
            return False
        if not self.tenant_combo.get():
            messagebox.showerror("Validation Error", "Tenant Preference is required")
            return False
        if not self.contact_entry.get().strip():
            messagebox.showerror("Validation Error", "Contact Number is required")
            return False
        if not self.owner_id_entry.get().strip():
            messagebox.showerror("Validation Error", "Owner ID is required")
            return False
        return True
    
    def create_room(self):
        if not self.supabase:
            messagebox.showwarning("Warning", "Please connect to Supabase first")
            return
        
        if not self.validate_form():
            return
        
        try:
            room_data = {
                "title": self.title_entry.get().strip(),
                "location": self.location_entry.get().strip(),
                "rent_price": float(self.price_entry.get().strip()),
                "property_type": self.property_type_combo.get(),
                "tenant_preference": self.tenant_combo.get(),
                "contact_number": self.contact_entry.get().strip(),
                "description": self.description_text.get("1.0", tk.END).strip(),
                "owner_id": self.owner_id_entry.get().strip(),
                "images": []
            }
            
            response = self.supabase.table("rooms").insert(room_data).execute()
            
            if response.data:
                messagebox.showinfo("Success", "Room created successfully!")
                self.clear_form()
                self.load_rooms()
            else:
                messagebox.showerror("Error", "Failed to create room")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create room: {str(e)}")
    
    def update_room(self):
        if not self.supabase:
            messagebox.showwarning("Warning", "Please connect to Supabase first")
            return
        
        if not self.current_room_id:
            messagebox.showwarning("Warning", "Please select a room to update")
            return
        
        if not self.validate_form():
            return
        
        try:
            room_data = {
                "title": self.title_entry.get().strip(),
                "location": self.location_entry.get().strip(),
                "rent_price": float(self.price_entry.get().strip()),
                "property_type": self.property_type_combo.get(),
                "tenant_preference": self.tenant_combo.get(),
                "contact_number": self.contact_entry.get().strip(),
                "description": self.description_text.get("1.0", tk.END).strip(),
                "owner_id": self.owner_id_entry.get().strip(),
                "updated_at": datetime.now().isoformat()
            }
            
            response = self.supabase.table("rooms").update(room_data).eq("id", self.current_room_id).execute()
            
            if response.data:
                messagebox.showinfo("Success", "Room updated successfully!")
                self.clear_form()
                self.load_rooms()
            else:
                messagebox.showerror("Error", "Failed to update room")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to update room: {str(e)}")
    
    def delete_room(self):
        if not self.supabase:
            messagebox.showwarning("Warning", "Please connect to Supabase first")
            return
        
        if not self.current_room_id:
            messagebox.showwarning("Warning", "Please select a room to delete")
            return
        
        # Confirm deletion
        if not messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this room?"):
            return
        
        try:
            response = self.supabase.table("rooms").delete().eq("id", self.current_room_id).execute()
            
            messagebox.showinfo("Success", "Room deleted successfully!")
            self.clear_form()
            self.load_rooms()
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to delete room: {str(e)}")


def main():
    root = tk.Tk()
    app = SupabaseAdminGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()

