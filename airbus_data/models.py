from sqlalchemy import String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base



class AirbusFile(Base):
    __tablename__ = 'airbus_files'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_type: Mapped[str] = mapped_column(String, nullable=False)
    aircraft_type_id: Mapped[int] = mapped_column(ForeignKey("aircraft_types.id", ondelete="CASCADE"), nullable=False)
    extension: Mapped[str] = mapped_column(String, nullable=False)
    revision_no: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=False)

    aircraft_type: Mapped["AircraftType"] = relationship("AircraftType", back_populates="airbus_files", lazy="joined")



class TaskTemplate(Base):
    __tablename__ = 'task_templates'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    airline_id: Mapped[int] = mapped_column(ForeignKey("airlines.id", ondelete="CASCADE"), nullable=False)
    airline: Mapped["Airline"] = relationship(back_populates="template", uselist=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    extension: Mapped[str] = mapped_column(String, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    reference:Mapped[bool] = mapped_column(Boolean, default=False)