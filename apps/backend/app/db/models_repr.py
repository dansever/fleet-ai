# apps/backend/app/db/models_repr.py
from sqlalchemy.inspection import inspect

def _pretty_repr_for(cls):
    def __repr__(self):
        mapper = inspect(self.__class__)
        parts = []
        for col in mapper.columns:  # columns only
            name = col.key
            try:
                val = getattr(self, name)
            except Exception:
                val = "<error>"
            parts.append(f"{name}={val!r}")
        return f"<{cls.__name__}({', '.join(parts)})>"
    return __repr__

def enable_pretty_repr(Base):
    """
    Attach __repr__ and __str__ to all mapped classes that use this Base.
    Call after importing models_auto so mappers are registered.
    """
    # ensure mappers are configured
    Base.registry.configure()  # safe to call multiple times
    for mapper in Base.registry.mappers:
        cls = mapper.class_
        # only patch if the class does not already define a custom repr
        if getattr(cls, "__repr__", object.__repr__) is object.__repr__:
            rep = _pretty_repr_for(cls)
            cls.__repr__ = rep
            cls.__str__ = rep
