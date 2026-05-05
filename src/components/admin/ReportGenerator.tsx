"use client";

import { useState } from 'react';
import { useQuery, useAction } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BarChart3, File } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportGeneratorProps {
  estateId: Id<"estates">;
}

export function ReportGenerator({ estateId }: ReportGeneratorProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(1703168400000).toISOString().split('T')[0], // Static date 7 days ago
    to: new Date(1703772000000).toISOString().split('T')[0], // Static date (base time)
  });
  const [format, setFormat] = useState<"summary" | "detailed">("summary");
  const [filters, setFilters] = useState({
    purpose: "all",
    status: "all",
  });
  const [generating, setGenerating] = useState(false);

  const reportData = useQuery(api.reports.generateVisitorReport, {
    estateId,
    dateRange: {
      from: new Date(dateRange.from).getTime(),
      to: new Date(dateRange.to + 'T23:59:59').getTime(),
    },
    format,
    filters: (filters.purpose !== "all" || filters.status !== "all") ? {
      purpose: filters.purpose === "all" ? undefined : filters.purpose,
      status: filters.status === "all" ? undefined : filters.status,
    } : undefined,
  });

  const exportCSV = useAction(api.reports.exportReportCSV);

  const handleExportCSV = async () => {
    setGenerating(true);
    try {
      const result = await exportCSV({
        estateId,
        dateRange: {
          from: new Date(dateRange.from).getTime(),
          to: new Date(dateRange.to + 'T23:59:59').getTime(),
        },
      });

      // Create and download file
      const blob = new Blob([result.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      if (!reportData?.visits) {
        console.error('No report data available');
        return;
      }

      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text('Visitor Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Report Period: ${dateRange.from} to ${dateRange.to}`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);

      // Add summary statistics if available
      if (reportData.summary) {
        doc.setFontSize(14);
        doc.text('Summary', 20, 65);
        doc.setFontSize(10);
        doc.text(`Total Visits: ${reportData.summary.totalVisits}`, 20, 80);
        doc.text(`Average Duration: ${formatDuration(reportData.summary.averageDuration)}`, 20, 90);
        doc.text(`Checked In: ${reportData.summary.checkedInCount}`, 20, 100);
        doc.text(`Checked Out: ${reportData.summary.checkedOutCount}`, 20, 110);
      }

      // Create table data
      const tableData = reportData.visits.map((visit: any) => [
        new Date(visit.checkinTime).toLocaleDateString(),
        new Date(visit.checkinTime).toLocaleTimeString(),
        visit.checkoutTime ? new Date(visit.checkoutTime).toLocaleTimeString() : "Still in",
        visit.guest?.name || "Unknown",
        visit.guest?.idNumber || "",
        visit.guest?.vehicleRegistration || "",
        visit.purpose,
        visit.resident?.name || "Walk-in",
        visit.resident?.unitNumber || "",
        formatDuration(visit.duration),
        visit.status.replace('_', ' '),
      ]);

      // Add table
      autoTable(doc, {
        head: [['Date', 'Check-in', 'Check-out', 'Guest', 'ID', 'Vehicle', 'Purpose', 'Host', 'Unit', 'Duration', 'Status']],
        body: tableData,
        startY: 130,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Save PDF
      doc.save(`visitor-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Visitor Report
          </CardTitle>
          <CardDescription>
            Create detailed reports of visitor activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Purpose</Label>
              <Select value={filters.purpose} onValueChange={(value) => setFilters(prev => ({ ...prev, purpose: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All purposes</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="overstay">Overstay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={generating}>
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Export CSV'}
            </Button>
            <Button onClick={handleExportPDF} disabled={generating} variant="outline">
              <File className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Report Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.summary.totalVisits}
                </div>
                <p className="text-sm text-gray-600">Total Visits</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.summary.uniqueGuests}
                </div>
                <p className="text-sm text-gray-600">Unique Guests</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reportData.summary.checkedInCount}
                </div>
                <p className="text-sm text-gray-600">Currently In</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatDuration(reportData.summary.averageDuration)}
                </div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
              </div>
            </div>

            {/* By Purpose Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Visits by Purpose</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Business: {reportData.summary.byPurpose.business}
                </Badge>
                <Badge variant="outline">
                  Personal: {reportData.summary.byPurpose.personal}
                </Badge>
                <Badge variant="outline">
                  Delivery: {reportData.summary.byPurpose.delivery}
                </Badge>
                <Badge variant="outline">
                  Maintenance: {reportData.summary.byPurpose.maintenance}
                </Badge>
              </div>
            </div>

            {/* Peak Hours */}
            {reportData.summary.peakHours.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Peak Hours</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.summary.peakHours.map((peak, index) => (
                    <Badge key={peak.hour} variant={index === 0 ? "default" : "outline"}>
                      {peak.hour}:00 ({peak.count} visits)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 