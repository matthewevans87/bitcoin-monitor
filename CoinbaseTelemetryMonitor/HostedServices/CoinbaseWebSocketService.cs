using CoinbasePro;
using CoinbasePro.Shared.Types;
using CoinbasePro.WebSocket.Models.Response;
using CoinbasePro.WebSocket.Types;
using CoinbaseTelemetryMonitor.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CoinbaseTelemetryMonitor.Services
{
    public class CoinbaseWebSocketService : IHostedService
    {
        public CoinbaseProClient Client { get; private set; }
        public List<ProductType> ProductTypes { get; private set; }
        public List<ChannelType> ChannelTypes { get; private set; }

        private IHubContext<TickerHub> _hubContext;

        public CoinbaseWebSocketService(IHubContext<TickerHub> hubContext)
        {
            _hubContext = hubContext;
            //create the CoinbasePro client without an authenticator
            Client = new CoinbaseProClient();

            //use the websocket feed
            ProductTypes = new List<ProductType>() { ProductType.BtcUsd };
            ChannelTypes = new List<ChannelType>() { ChannelType.Ticker };

            // EventHandler for the heartbeat response type
            Client.WebSocket.OnTickerReceived += WebSocket_OnTickerReceived;
        }


        public Task StartAsync(CancellationToken cancellationToken)
        {
            Client.WebSocket.Start(ProductTypes, ChannelTypes);
            return Task.CompletedTask;
        }

        private void WebSocket_OnTickerReceived(object sender, WebfeedEventArgs<Ticker> e)
        {
            BroadcastPriceUpdate(e.LastOrder.Price);
            Console.WriteLine(e);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Client.WebSocket.Stop();
            return Task.CompletedTask;
        }

        private async void BroadcastPriceUpdate(decimal price)
        {
            await _hubContext.Clients.All.SendAsync("PriceUpdate", price);
        }
    }
}
