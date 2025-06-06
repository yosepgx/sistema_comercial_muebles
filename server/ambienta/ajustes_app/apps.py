from django.apps import AppConfig


class AjustesAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ajustes_app'

    def ready(self):
        import ajustes_app.signals 
