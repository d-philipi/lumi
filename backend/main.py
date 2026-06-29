from google import genai
from dotenv import load_dotenv
from rich.console import Console
from rich.style import Style

load_dotenv()
console = Console()
client = genai.Client()

# A simple interaction with the AI
interaction = client.interactions.create(
    model="gemini-2.5-flash",
    input="Explain how AI works in a few words",
)

print(interaction.output_text)

# A stream interaction with the AI
stream = client.interactions.create(
    model="gemini-2.5-flash",
    input="Explain how AI works",
    stream=True,
)

print("\n--- Streaming response ---\n")

for event in stream:
    if event.event_type == "step.delta" and event.delta.type == "text":
        console.print(event.delta.text, end="")
    elif event.event_type == "interaction.completed":
        console.print("\n", style="bold green")

print("\n\n--- Done ---")
