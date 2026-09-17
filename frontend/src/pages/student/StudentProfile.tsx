import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Calendar, Droplets, Globe, Heart } from "lucide-react";
import { getMyProfile } from "../../services/studentPortal";

export function StudentProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: getMyProfile,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-slate-500">Profile not found.</div>;
  }

  const fields = [
    { icon: <User size={16} />, label: "Full Name", value: `${profile.first_name} ${profile.last_name}` },
    { icon: <Mail size={16} />, label: "Email", value: profile.email || "—" },
    { icon: <Phone size={16} />, label: "Phone", value: profile.phone || "—" },
    { icon: <MapPin size={16} />, label: "Address", value: profile.address || "—" },
    { icon: <Calendar size={16} />, label: "Date of Birth", value: profile.date_of_birth || "—" },
    { icon: <User size={16} />, label: "Gender", value: profile.gender || "—" },
    { icon: <Droplets size={16} />, label: "Blood Group", value: profile.blood_group || "—" },
    { icon: <Globe size={16} />, label: "Nationality", value: profile.nationality || "—" },
    { icon: <Heart size={16} />, label: "Religion", value: profile.religion || "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">View your personal information.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
              {profile.first_name.charAt(0)}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{profile.first_name} {profile.last_name}</h2>
              <p className="text-sm text-white/80">{profile.student_code}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{f.label}</p>
                  <p className="text-sm font-medium text-slate-800">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-medium">Class</p>
              <p className="text-lg font-bold text-indigo-800">{profile.class?.name ?? "—"}</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">Section</p>
              <p className="text-lg font-bold text-purple-800">{profile.section?.name ?? "—"}</p>
            </div>
            <div className="p-4 rounded-xl bg-pink-50 border border-pink-100">
              <p className="text-xs text-pink-600 font-medium">Roll Number</p>
              <p className="text-lg font-bold text-pink-800">{profile.roll_number ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
