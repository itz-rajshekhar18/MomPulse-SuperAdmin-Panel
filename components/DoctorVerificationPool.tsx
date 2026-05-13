'use client';

import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  credentials: string;
  status: 'approved' | 'rejected' | 'pending';
}

export default function DoctorVerificationPool() {
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Julian Verna',
      specialty: 'Pediatrics',
      experience: '14 Years',
      credentials: 'HL_Verna_Cred.pdf',
      status: 'approved',
    },
    {
      id: '2',
      name: 'Dr. Sarah Khaldi',
      specialty: 'Pediatrics',
      experience: '8 Years',
      credentials: 'Khaldi_Cred_2023.pdf',
      status: 'rejected',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Doctor Verification Pool</h3>
          <p className="text-sm text-gray-600">Credentials verification awaiting review</p>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
          Export Report
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Medical Expert
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Specialization
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Experience
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Credentials
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900">{doctor.name}</p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.specialty === 'Pediatrics'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {doctor.specialty}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600">{doctor.experience}</td>
                <td className="py-4 px-4">
                  <a href="#" className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {doctor.credentials}
                  </a>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        doctor.status === 'approved'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {doctor.status === 'approved' ? 'Approve' : 'Approve'}
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        doctor.status === 'rejected'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {doctor.status === 'rejected' ? 'Reject' : 'Reject'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
