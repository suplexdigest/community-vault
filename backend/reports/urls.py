from django.urls import path

from . import views

urlpatterns = [
    path("financial-summary/", views.financial_summary, name="report-financial-summary"),
    path("delinquency/", views.delinquency_report, name="report-delinquency"),
    path("violation-summary/", views.violation_summary, name="report-violation-summary"),
    path("maintenance-summary/", views.maintenance_summary, name="report-maintenance-summary"),
    path("owner-directory/", views.owner_directory, name="report-owner-directory"),
    path("assessment-aging/", views.assessment_aging, name="report-assessment-aging"),
]
