import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";

export default function DashboardPage() {

  const [statistik,setStatistik] = useState({});
  const [posyanduList,setPosyanduList] = useState([]);
  const [trenStunting,setTrenStunting] = useState([]);
  const [upcomingJadwal,setUpcomingJadwal] = useState([]);
  const [balitaList,setBalitaList] = useState([]);

  useEffect(()=>{

    fetch("/api/dashboard")
      .then(res=>res.json())
      .then(data=>{
        setStatistik(data.statistik || {});
        setPosyanduList(data.posyandu || []);
        setTrenStunting(data.trenStunting || []);
        setUpcomingJadwal(data.jadwal || []);
        setBalitaList(data.balita || []);
      })
      .catch(err=>{
        console.log("Error fetch dashboard:",err);
      });

  },[]);

  return (

    <AdminDashboard
      statistik={statistik}
      posyanduList={posyanduList}
      trenStunting={trenStunting}
      upcomingJadwal={upcomingJadwal}
      balitaList={balitaList}
    />

  );

}