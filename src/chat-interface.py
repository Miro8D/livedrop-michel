import requests
import sys

def main():
    base_url = input("Enter your ngrok base URL: ").strip()
    
    if not base_url.startswith("http"):
        print("Invalid URL.")
        sys.exit(1)

    print("Connected to", base_url)
    print("Type 'exit' to quit.")

    while True:
        query = input("> ")
        if query.lower() in ["exit", "quit"]:
            print("Goodbye")
            break
        
        try:
            response = requests.post(f"{base_url}/chat", json={"query": query})
            if response.status_code == 200:
                data = response.json()
                print("Answer:", data.get("answer", "No answer"))
            else:
                print("Error", response.status_code, response.text)
        except Exception as e:
            print("Connection error:", e)

if __name__ == "__main__":
    main()
