import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Calendar } from 'lucide-react';

const AdminStatsCards = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    absentToday: 0,
    leavesToday: 0,
  });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
    const today = new Date().toDateString();

    const employees = users.filter(user => user.role === 'employee');
    const totalEmployees = employees.length;

    const activeTodaySet = new Set();
    timeEntries.forEach(entry => {
      if (new Date(entry.timestamp).toDateString() === today && entry.type === 'entry') {
        activeTodaySet.add(entry.userId);
      }
    });
    const activeToday = activeTodaySet.size;
    const absentToday = totalEmployees - activeToday;

    const leavesToday = leaves.filter(leave => {
      const startDate = new Date(leave.startDate).setHours(0,0,0,0);
      const endDate = new Date(leave.endDate).setHours(23,59,59,999);
      const todayDate = new Date(today).getTime();
      return todayDate >= startDate && todayDate <= endDate && leave.status === 'approved';
    }).length;

    setStats({ totalEmployees, activeToday, absentToday, leavesToday });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
        <Card className="glass-effect border-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Employés enregistrés</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
        <Card className="glass-effect border-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents Aujourd'hui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">Employés pointés</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
        <Card className="glass-effect border-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents Aujourd'hui</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.absentToday}</div>
            <p className="text-xs text-muted-foreground">Employés non pointés</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
        <Card className="glass-effect border-gradient hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Congé Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.leavesToday}</div>
            <p className="text-xs text-muted-foreground">Employés en congé</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminStatsCards;