import streamlit as st
import os
from modules import __init__

st.set_page_config(page_title="Hello World App", page_icon="👋")

st.title("Hello World! 👋")
st.write("Welcome to our simple Streamlit test application!")

st.subheader("Environment Check")
st.write("This app is running in a Docker container with live code editing enabled.")

env_var = os.getenv("APP_ENV", "development")
st.write(f"Current environment: **{env_var}**")

st.divider()

st.subheader("Test Features")
col1, col2 = st.columns(2)

with col1:
    name = st.text_input("Enter your name", "World")
    
with col2:
    st.write(f"Hello, {name}!")

if st.button("Click me!"):
    st.balloons()
    st.success("Button clicked! Everything is working correctly! 🎉")

st.divider()
st.caption("This is a minimal hello world app to test the Docker Compose setup.")