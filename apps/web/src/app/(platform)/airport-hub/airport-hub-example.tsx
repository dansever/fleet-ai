'use client';

import AirportList from '@/components/airport-list';
import { FleetSidebar } from '@/components/fleet-sidebar';
import { DataTable } from '@/components/library/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Fuel,
  MapPin,
  Plane,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// Mock data - replace with your actual data
const mockAirports = [
  {
    id: '1',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY',
    country: 'US',
    iata: 'JFK',
    icao: 'KJFK',
    isHub: true,
  },
  {
    id: '2',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    iata: 'LAX',
    icao: 'KLAX',
    isHub: true,
  },
  {
    id: '3',
    name: "Chicago O'Hare International Airport",
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    iata: 'ORD',
    icao: 'KORD',
    isHub: false,
  },
  {
    id: '4',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY',
    country: 'US',
    iata: 'JFK',
    icao: 'KJFK',
    isHub: true,
  },
  {
    id: '5',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY',
    country: 'US',
    iata: 'JFK',
    icao: 'KJFK',
    isHub: true,
  },
  {
    id: '6',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY',
    country: 'US',
    iata: 'JFK',
    icao: 'KJFK',
    isHub: true,
  },
  {
    id: '7',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY',
    country: 'US',
    iata: 'JFK',
    icao: 'KJFK',
    isHub: true,
  },
];

const mockContracts = [
  {
    id: '1',
    serviceType: 'Ground Handling',
    vendor: 'SkyServ Ground Services',
    contractValue: '$2,400,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    contactPerson: 'Mike Johnson',
    email: 'mike.johnson@skyserv.com',
    phone: '+1 (555) 123-4567',
  },
  {
    id: '2',
    serviceType: 'Fuel Supply',
    vendor: 'AeroFuel International',
    contractValue: '$8,750,000',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'Active',
    contactPerson: 'Sarah Williams',
    email: 'sarah.williams@aerofuel.com',
    phone: '+1 (555) 987-6543',
  },
  {
    id: '3',
    serviceType: 'Catering Services',
    vendor: 'Premium Sky Catering',
    contractValue: '$1,200,000',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'Pending Renewal',
    contactPerson: 'David Chen',
    email: 'david.chen@skycatering.com',
    phone: '+1 (555) 456-7890',
  },
  {
    id: '4',
    serviceType: 'Aircraft Maintenance',
    vendor: 'TechWing Maintenance',
    contractValue: '$3,500,000',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    contactPerson: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@techwing.com',
    phone: '+1 (555) 234-5678',
  },
];

const contractColumns = [
  {
    key: 'serviceType',
    label: 'Service Type',
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center gap-2">
        {value === 'Ground Handling' && <Users className="w-4 h-4 text-blue-500" />}
        {value === 'Fuel Supply' && <Fuel className="w-4 h-4 text-orange-500" />}
        {value === 'Catering Services' && <Building2 className="w-4 h-4 text-green-500" />}
        {value === 'Aircraft Maintenance' && <Wrench className="w-4 h-4 text-purple-500" />}
        <span className="font-medium">{value}</span>
      </div>
    ),
  },
  {
    key: 'vendor',
    label: 'Vendor',
    sortable: true,
  },
  {
    key: 'contractValue',
    label: 'Contract Value',
    sortable: true,
    render: (value: string) => <span className="font-semibold text-green-600">{value}</span>,
  },
  {
    key: 'startDate',
    label: 'Start Date',
    sortable: true,
  },
  {
    key: 'endDate',
    label: 'End Date',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: string) => (
      <Badge
        variant={
          value === 'Active' ? 'default' : value === 'Pending Renewal' ? 'secondary' : 'destructive'
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'contactPerson',
    label: 'Contact',
    sortable: true,
  },
];

export default function AirportHubPage() {
  const [selectedAirport, setSelectedAirport] = useState(mockAirports[0]);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'Ground Handling':
        return <Users className="w-5 h-5" />;
      case 'Fuel Supply':
        return <Fuel className="w-5 h-5" />;
      case 'Catering Services':
        return <Building2 className="w-5 h-5" />;
      case 'Aircraft Maintenance':
        return <Wrench className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fleet Sidebar */}
      <FleetSidebar />

      {/* Airport List Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-white/50 backdrop-blur-sm">
        <AirportList
          airports={mockAirports}
          onAirportSelect={setSelectedAirport}
          selectedAirport={selectedAirport}
          InsertAddAirportButton={true}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* FleetAI Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Airport Hub</h1>
                <p className="text-slate-600">
                  Ground services contracts and airport operations management
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <FileText className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>

          {/* AI Co-Pilot Insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Monitoring</h3>
                  <p className="text-sm text-slate-600">Contract Analysis</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">24/7</p>
              <p className="text-sm text-slate-600">Active monitoring</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Cost Savings</h3>
                  <p className="text-sm text-slate-600">This Quarter</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">$125K</p>
              <p className="text-sm text-slate-600">Leakage prevented</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Compliance</h3>
                  <p className="text-sm text-slate-600">Airport Average</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">97.8%</p>
              <p className="text-sm text-slate-600">Above target</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Active Alerts</h3>
                  <p className="text-sm text-slate-600">Require Attention</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">1</p>
              <p className="text-sm text-slate-600">Contract renewal due</p>
            </Card>
          </div>

          {/* Airport Details Card */}
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg rounded-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {selectedAirport.isHub ? (
                      <Building2 className="w-6 h-6 text-white" />
                    ) : (
                      <Plane className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {selectedAirport.name}
                    </CardTitle>
                    <p className="text-slate-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedAirport.city}, {selectedAirport.state}, {selectedAirport.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {selectedAirport.iata}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {selectedAirport.icao}
                  </Badge>
                  {selectedAirport.isHub && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      Hub Airport
                    </Badge>
                  )}
                  {/* Action Buttons for FleetAI Functionality */}
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Procurement Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50">
                      <span className="text-sm text-slate-600">Active Contracts</span>
                      <span className="font-bold text-blue-700">
                        {mockContracts.filter((c) => c.status === 'Active').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50">
                      <span className="text-sm text-slate-600">Annual Spend</span>
                      <span className="font-bold text-green-700">$15.85M</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100/50">
                      <span className="text-sm text-slate-600">Compliance Rate</span>
                      <span className="font-bold text-orange-700">97.8%</span>
                    </div>
                    {/* Leakage Detection Metric */}
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100/50">
                      <span className="text-sm text-slate-600">Leakage Detected</span>
                      <span className="font-bold text-purple-700">$3.2K</span>
                    </div>
                  </div>
                </div>

                {/* Service Types */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-purple-500" />
                    Ground Services
                  </h3>
                  <div className="space-y-2">
                    {Array.from(new Set(mockContracts.map((c) => c.serviceType))).map(
                      (serviceType) => {
                        const contractCount = mockContracts.filter(
                          (c) => c.serviceType === serviceType,
                        ).length;
                        return (
                          <div
                            key={serviceType}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              {getServiceIcon(serviceType)}
                              <span className="text-sm font-medium text-slate-700">
                                {serviceType}
                              </span>
                            </div>
                            <Badge className="bg-slate-100 text-slate-700">{contractCount}</Badge>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    {/* Updated Recent Activity to Show AI-Powered Insights */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-slate-900">Contract Optimized</p>
                      </div>
                      <p className="text-xs text-slate-600">Fuel supply rates reduced by 3.2%</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-100/50 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm font-medium text-slate-900">Renewal Alert</p>
                      </div>
                      <p className="text-xs text-slate-600">Catering contract expires in 30 days</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-slate-900">Leakage Detected</p>
                      </div>
                      <p className="text-xs text-slate-600">Ground handling overage flagged</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ground Services Contracts Table */}
          <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg rounded-3xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    Ground Services Contracts
                  </CardTitle>
                  <p className="text-slate-600 mt-1">
                    AI-monitored contracts with leakage detection for {selectedAirport.name}
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl">
                  <FileText className="w-4 h-4 mr-2" />
                  New Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockContracts}
                columns={contractColumns}
                searchPlaceholder="Search contracts..."
                onRowClick={(contract) => console.log('Contract clicked:', contract)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
