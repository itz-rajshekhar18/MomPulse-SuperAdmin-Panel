'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, FileText, MapPin, Globe, Loader, Plus, X } from 'lucide-react';
import { getDoctorRequests, approveDoctorRequest, rejectDoctorRequest, createDoctor } from '@/lib/moderation';
import type { DoctorRequest } from '@/lib/moderation';

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [doctors, setDoctors] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    credentials: '',
    location: '',
    languages: '',
    bio: '',
    email: '',
    services: [{ name: '', price: '' }],
  });

  // Fetch doctors on mount and when filter changes
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const status = filterStatus === 'all' ? undefined : (filterStatus as 'pending' | 'approved' | 'rejected');
        const data = await getDoctorRequests(status);
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [filterStatus]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = doctors.filter((d) => d.status === 'pending').length;

  const handleApprove = async (doctorId: string) => {
    setActionLoading(doctorId);
    try {
      const success = await approveDoctorRequest(doctorId);
      if (success) {
        setDoctors(doctors.map((d) => (d.id === doctorId ? { ...d, status: 'approved' } : d)));
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId: string) => {
    setActionLoading(doctorId);
    try {
      const success = await rejectDoctorRequest(doctorId);
      if (success) {
        setDoctors(doctors.map((d) => (d.id === doctorId ? { ...d, status: 'rejected' } : d)));
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      specialty: '',
      experience: '',
      credentials: '',
      location: '',
      languages: '',
      bio: '',
      email: '',
      services: [{ name: '', price: '' }],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      specialty: '',
      experience: '',
      credentials: '',
      location: '',
      languages: '',
      bio: '',
      email: '',
      services: [{ name: '', price: '' }],
    });
  };

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', price: '' }],
    });
  };

  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const handleServiceChange = (index: number, field: 'name' | 'price', value: string) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;
    setFormData({
      ...formData,
      services: updatedServices,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('submit');

    try {
      const doctorData = {
        name: formData.name,
        specialty: formData.specialty,
        experience: formData.experience,
        credentials: formData.credentials,
        location: formData.location,
        languages: formData.languages.split(',').map((l) => l.trim()),
        bio: formData.bio,
        email: formData.email,
        services: formData.services.filter((s) => s.name && s.price),
      };

      console.log('Submitting doctor data:', doctorData);
      const doctorId = await createDoctor(doctorData);
      if (doctorId) {
        const newDoctor: DoctorRequest = {
          id: doctorId,
          ...doctorData,
          status: 'pending',
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        };
        setDoctors([...doctors, newDoctor]);
        handleCloseModal();
        alert('Doctor added successfully! Please review and approve/reject.');
      } else {
        alert('Failed to add doctor. Check console for details.');
      }
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      alert(`Error adding doctor: ${error.message || 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      approved: 'bg-green-100 text-green-800 border border-green-300',
      rejected: 'bg-red-100 text-red-800 border border-red-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-1">Manage and approve doctor profiles</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenModal}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
            {pendingCount} Pending
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No doctors found</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Doctor Info */}
                  <div className="md:col-span-1">
                    <div className="bg-blue-500 w-20 h-20 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{doctor.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-purple-600 font-semibold mt-1">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                      <Globe className="w-4 h-4" />
                      {doctor.languages.join(', ')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {doctor.location}
                    </div>
                  </div>

                  {/* Credentials & Services */}
                  <div className="md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Credentials</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700">Medical License #892190</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <a href="#" className="text-xs text-blue-600 hover:underline">Board Cert.pdf</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <a href="#" className="text-xs text-blue-600 hover:underline">Insurance.pdf</a>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="md:col-span-1">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Services</h4>
                    <div className="space-y-2">
                      {doctor.services.map((service, idx) => (
                        <div key={idx} className="text-xs">
                          <p className="text-gray-700 font-medium">{service.name}</p>
                          <p className="text-gray-500">{service.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(doctor.status)}`}>
                        {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                      </span>
                    </div>
                    {doctor.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApprove(doctor.id)}
                          disabled={actionLoading === doctor.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading === doctor.id ? <Loader className="w-4 h-4 animate-spin" /> : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(doctor.id)}
                          disabled={actionLoading === doctor.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading === doctor.id ? <Loader className="w-4 h-4 animate-spin" /> : '✗ Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Dr. John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="doctor@example.com"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Specialty *</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Obstetrics & Gynecology"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Experience (years) *</label>
                <input
                  type="text"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="10+ years"
                />
              </div>

              {/* Credentials */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Credentials *</label>
                <input
                  type="text"
                  required
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="MD, Board Certified"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="New York, USA"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Languages (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="English, Spanish"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief bio about the doctor"
                  rows={3}
                />
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">Services</label>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    + Add Service
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Service name"
                      />
                      <input
                        type="text"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Price"
                      />
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'submit' ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Doctor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
