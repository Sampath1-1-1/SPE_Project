import os

commands = [
    "docker build -t aaradhyaghota/middleware:latest /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/MiddleWare",
    "docker build -t aaradhyaghota/model-service:latest /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/Model-service",
    "docker build -t aaradhyaghota/frontend:latest /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/frontend",
    "docker push aaradhyaghota/middleware:latest",
    "docker push aaradhyaghota/model-service:latest",
    "docker push aaradhyaghota/frontend:latest",
    "kubectl apply -f /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/Kubernates/frontend.yaml",
    "kubectl apply -f /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/Kubernates/mysql.yaml",
    "kubectl apply -f /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/Kubernates/model-service.yaml",
    "kubectl apply -f /home/aaradhya-ghota/SoftwareProduction/Major_Project_spe/Backend/Kubernates/middleware.yaml"
]


for cmd in commands:
    print(f"\nRunning: {cmd}")
    os.system(cmd)
