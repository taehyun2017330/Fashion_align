# backend/__init__.py

from flask import Flask


def create_app():
    app = Flask(__name__)
    # app.config.from_object(Config)

    from app.routes import api

    # Register the API blueprint
    app.register_blueprint(api.bp, url_prefix='/api')

    return app
