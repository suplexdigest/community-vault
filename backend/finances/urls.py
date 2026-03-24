from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"assessments", views.AssessmentViewSet, basename="assessment")
router.register(r"payments", views.PaymentViewSet, basename="payment")
router.register(r"vendors", views.VendorViewSet, basename="vendor")
router.register(r"budget-categories", views.BudgetCategoryViewSet, basename="budget-category")
router.register(r"budgets", views.BudgetViewSet, basename="budget")
router.register(r"expenses", views.ExpenseViewSet, basename="expense")
router.register(r"reserve-funds", views.ReserveFundViewSet, basename="reserve-fund")

urlpatterns = router.urls
