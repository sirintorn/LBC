<%-- 
    Document   : index
    Created on : Apr 7, 2016, 12:44:49 PM
    Author     : JIRAPORN
--%>



<%@page import="java.sql.ResultSet"%>
<%@page import="gpsasia.data.dao.DbConnector"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>


<!DOCTYPE html>

<%
    String datadesc="";
    try {
        DbConnector connector = new DbConnector(DbConnector.ConnectionName.GN);
        String sqlcmd = "SELECT datadesc from policyofuse\n"
                + "where id='1'";
        ResultSet rs = connector.QueryData(sqlcmd);
        while (rs.next()) {
            datadesc = rs.getString("datadesc");
        }
    } catch (Exception ex) {
    }
%>

<html>
    <head>
    </head>

    <body ng-app="starter">
    <ion-nav-view></ion-nav-view>
</body>

<body>
    <div style="overflow:auto;">
         <%=datadesc%>
    </div>
</body>
</html>

