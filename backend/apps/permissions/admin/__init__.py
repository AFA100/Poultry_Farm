from django.contrib import admin
from django.db import models as django_models

from apps.permissions import models as app_models


def _register_app_models(model_module):
    for attr_name in dir(model_module):
        attr = getattr(model_module, attr_name)
        if not isinstance(attr, type):
            continue
        if not issubclass(attr, django_models.Model):
            continue
        if attr is django_models.Model:
            continue
        meta = getattr(attr, "_meta", None)
        if getattr(meta, "abstract", False):
            continue
        try:
            admin.site.register(attr)
        except admin.sites.AlreadyRegistered:
            pass


_register_app_models(app_models)
