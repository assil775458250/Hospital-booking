# 1. مرحلة البناء (Build Stage)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# نسخ ملف الـ csproj فقط أولاً للاستفادة من كاش الـ Docker
COPY ["HospitalBooking.API/HospitalBooking.API.csproj", "HospitalBooking.API/"]
RUN dotnet restore "HospitalBooking.API/HospitalBooking.API.csproj"

# نسخ باقي الملفات
COPY . .
WORKDIR "/src/HospitalBooking.API"
RUN dotnet publish "HospitalBooking.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. مرحلة التشغيل (Runtime Stage)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# ضبط المنفذ 10000 (المناسب لمنصة Render)
ENV ASPNETCORE_HTTP_PORTS=10000
ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "HospitalBooking.API.dll"]
