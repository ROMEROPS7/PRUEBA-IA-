"""
Notification service for sending alerts via multiple channels.
"""

import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class NotificationService:
    """Handles notifications via SMS, email, WhatsApp, etc."""

    async def send_sms(self, phone: str, message: str) -> bool:
        """
        Send SMS notification.

        **Parameters:**
        - phone: Phone number in format +34912345678
        - message: Message content (max 160 chars for standard SMS)

        **Returns:** True if successful, False otherwise
        """
        logger.info(f"Sending SMS to {phone}")
        try:
            # TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
            # In production:
            # client = boto3.client('sns')
            # response = client.publish(
            #     PhoneNumber=phone,
            #     Message=message
            # )
            logger.info(f"SMS sent to {phone}: {message[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Error sending SMS to {phone}: {e}")
            return False

    async def send_email(self, to: str, subject: str, body: str) -> bool:
        """
        Send email notification.

        **Parameters:**
        - to: Email address
        - subject: Email subject
        - body: HTML email body

        **Returns:** True if successful, False otherwise
        """
        logger.info(f"Sending email to {to}")
        try:
            # TODO: Integrate with email service (SendGrid, AWS SES, etc.)
            # In production:
            # from sendgrid import SendGridAPIClient
            # from sendgrid.helpers.mail import Mail
            # message = Mail(
            #     from_email='noreply@segurcaixa.es',
            #     to_emails=to,
            #     subject=subject,
            #     html_content=body
            # )
            # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            # response = sg.send(message)
            logger.info(f"Email sent to {to} with subject: {subject}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {to}: {e}")
            return False

    async def send_whatsapp(self, phone: str, message: str) -> bool:
        """
        Send WhatsApp notification.

        **Parameters:**
        - phone: Phone number with country code
        - message: Message content

        **Returns:** True if successful, False otherwise
        """
        logger.info(f"Sending WhatsApp to {phone}")
        try:
            # TODO: Integrate with WhatsApp API provider (Twilio, Meta, etc.)
            # In production:
            # twilio_client = Client(ACCOUNT_SID, AUTH_TOKEN)
            # message = twilio_client.messages.create(
            #     from_='whatsapp:+34912345678',
            #     body=message,
            #     to=f'whatsapp:{phone}'
            # )
            logger.info(f"WhatsApp sent to {phone}: {message[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Error sending WhatsApp to {phone}: {e}")
            return False

    async def notify_new_siniestro(
        self,
        numero_siniestro: str,
        cliente_id: str,
        canal: str,
        prioridad: str,
    ) -> bool:
        """
        Notify gestor and cliente about new siniestro.

        **Parameters:**
        - numero_siniestro: Claim number
        - cliente_id: Client identifier
        - canal: Channel used for claim
        - prioridad: Claim priority

        **Process:**
        1. Send SMS/email to gestores about new high priority claim
        2. Send SMS to cliente confirming receipt
        3. Log notification
        """
        logger.info(
            f"Notifying about new siniestro {numero_siniestro} (prioridad: {prioridad})"
        )

        try:
            # Notify gestores if high priority
            if prioridad in ["alta", "critica"]:
                gestor_message = (
                    f"NUEVA RECLAMACIÓN: {numero_siniestro}\n"
                    f"Prioridad: {prioridad.upper()}\n"
                    f"Requiere atención inmediata."
                )
                # Send to gestor group (placeholder)
                logger.info(f"Gestor notification: {gestor_message}")

            # Notify client
            cliente_message = (
                f"Hemos recibido su reclamación {numero_siniestro}.\n"
                f"Seguiremos en contacto."
            )
            await self.send_whatsapp("+34912345678", cliente_message)

            logger.info(f"Notificaciones enviadas para siniestro {numero_siniestro}")
            return True

        except Exception as e:
            logger.error(f"Error notifying siniestro {numero_siniestro}: {e}")
            return False

    async def notify_gestor(
        self,
        siniestro_data: dict,
        notificacion_type: str = "nueva_reclamacion",
    ) -> bool:
        """
        Notify gestor about siniestro event via SMS and email.

        **Parameters:**
        - siniestro_data: Siniestro information dict
        - notificacion_type: Type of notification

        **Returns:** True if notification sent successfully
        """
        logger.info(f"Notifying gestor about {notificacion_type}")

        try:
            numero_siniestro = siniestro_data.get("numero_siniestro", "N/A")
            prioridad = siniestro_data.get("prioridad", "media")
            cliente_nombre = siniestro_data.get("cliente_nombre", "Desconocido")

            # Build message
            if notificacion_type == "nueva_reclamacion":
                mensaje = (
                    f"NUEVA RECLAMACIÓN: {numero_siniestro}\n"
                    f"Cliente: {cliente_nombre}\n"
                    f"Prioridad: {prioridad}\n"
                    f"Acción: Revisar en sistema"
                )
            elif notificacion_type == "asignacion":
                mensaje = (
                    f"ASIGNACIÓN: {numero_siniestro}\n"
                    f"Ha sido asignada a usted\n"
                    f"Prioridad: {prioridad}"
                )
            elif notificacion_type == "escalacion":
                mensaje = (
                    f"ESCALACIÓN: {numero_siniestro}\n"
                    f"Requiere intervención manual\n"
                    f"Prioridad: {prioridad}"
                )
            else:
                mensaje = f"Actualización de siniestro: {numero_siniestro}"

            # Send notifications
            # TODO: Get gestor contact info from database
            gestor_phone = "+34912345678"  # Placeholder
            gestor_email = "gestor@segurcaixa.es"  # Placeholder

            await self.send_sms(gestor_phone, mensaje)
            await self.send_email(
                gestor_email,
                f"SegurCaixa Adeslas - {numero_siniestro}",
                f"<p>{mensaje.replace(chr(10), '<br>')}</p>",
            )

            logger.info(f"Gestor notificado sobre {numero_siniestro}")
            return True

        except Exception as e:
            logger.error(f"Error notifying gestor: {e}")
            return False

    async def notify_cliente(
        self,
        cliente_id: str,
        mensaje: str,
        tipo: str = "informacion",
    ) -> bool:
        """
        Notify client about siniestro status via WhatsApp/SMS.

        **Parameters:**
        - cliente_id: Client identifier
        - mensaje: Message content
        - tipo: Message type (informacion, estado, accion_requerida, etc.)

        **Returns:** True if notification sent
        """
        logger.info(f"Notifying cliente {cliente_id}: {tipo}")

        try:
            # TODO: Get cliente contact info from database
            cliente_phone = "+34912345678"  # Placeholder
            cliente_email = "cliente@example.com"  # Placeholder

            # Determine channel based on cliente preference
            # Default: WhatsApp > SMS > Email
            sent = await self.send_whatsapp(cliente_phone, mensaje)

            if not sent:
                # Fallback to SMS
                sent = await self.send_sms(cliente_phone, mensaje)

            if not sent:
                # Fallback to email
                await self.send_email(
                    cliente_email,
                    "SegurCaixa Adeslas - Actualización de tu reclamación",
                    f"<p>{mensaje.replace(chr(10), '<br>')}</p>",
                )

            logger.info(f"Cliente {cliente_id} notificado: {tipo}")
            return True

        except Exception as e:
            logger.error(f"Error notifying cliente {cliente_id}: {e}")
            return False

    async def notify_siniestro_approved(
        self,
        numero_siniestro: str,
        cliente_id: str,
    ) -> bool:
        """
        Notify client that their claim has been approved.

        **Parameters:**
        - numero_siniestro: Claim number
        - cliente_id: Client identifier

        **Returns:** True if notification sent
        """
        mensaje = (
            f"Tu reclamación {numero_siniestro} ha sido APROBADA.\n"
            f"Recibirás los detalles de pago en tu correo.\n"
            f"Gracias por tu confianza."
        )

        return await self.notify_cliente(
            cliente_id=cliente_id,
            mensaje=mensaje,
            tipo="aprobacion",
        )

    async def notify_siniestro_rejected(
        self,
        numero_siniestro: str,
        cliente_id: str,
    ) -> bool:
        """
        Notify client that their claim has been rejected.

        **Parameters:**
        - numero_siniestro: Claim number
        - cliente_id: Client identifier

        **Returns:** True if notification sent
        """
        mensaje = (
            f"Tu reclamación {numero_siniestro} ha sido RECHAZADA.\n"
            f"Consulta los detalles en tu área de cliente.\n"
            f"Puedes apelar esta decisión contactándonos."
        )

        return await self.notify_cliente(
            cliente_id=cliente_id,
            mensaje=mensaje,
            tipo="rechazo",
        )

    async def notify_documentation_required(
        self,
        numero_siniestro: str,
        cliente_id: str,
        documentos_requeridos: list,
    ) -> bool:
        """
        Notify client that additional documentation is required.

        **Parameters:**
        - numero_siniestro: Claim number
        - cliente_id: Client identifier
        - documentos_requeridos: List of required documents

        **Returns:** True if notification sent
        """
        docs_str = "\n".join([f"- {doc}" for doc in documentos_requeridos])
        mensaje = (
            f"Reclamación {numero_siniestro}:\n"
            f"Necesitamos los siguientes documentos:\n"
            f"{docs_str}\n"
            f"Puedes subirlos en tu área de cliente."
        )

        return await self.notify_cliente(
            cliente_id=cliente_id,
            mensaje=mensaje,
            tipo="accion_requerida",
        )

    def get_notification_stats(self) -> dict:
        """
        Get notification service statistics.

        **Returns:** Service metrics and status
        """
        return {
            "status": "operational",
            "timestamp": datetime.utcnow().isoformat(),
            "channels_available": ["sms", "email", "whatsapp"],
        }
